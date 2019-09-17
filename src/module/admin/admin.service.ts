import { Model } from 'mongoose'
import * as md5 from 'md5'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { IAdmin } from './admin.interfaces'
import { CreateAdminDTO, ResetPassDTO } from './admin.dto'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'

@Injectable()
export class AdminService {
  constructor(
    @Inject('AdminModelToken') private readonly adminModel: Model<IAdmin>,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(EmailUtil) private readonly emailUtil: EmailUtil,
    @Inject(PhoneUtil) private readonly phonUtil: PhoneUtil,
    private redis: RedisService,
    private config: ConfigService,

  ) { }

  // 创建数据
  async create(createAdminDTO: CreateAdminDTO): Promise<IAdmin> {
    const existing = await this.adminModel.findOne({ phone: createAdminDTO.phone, isDelete: false })
    if (existing) {
      throw new ApiException('手机已注册', ApiErrorCode.PHONE_EXIST, 406)
    }
    // 新账号创建
    createAdminDTO.password = await this.cryptoUtil.encryptPassword(createAdminDTO.password)
    return await this.adminModel.create(createAdminDTO)
  }

  // 根据id查找
  async findById(id: string): Promise<IAdmin> {
    return await this.adminModel.findById(id).lean().exec()
  }
  // 根据账号查找
  async findByUsername(username: string) {
    return await this.adminModel
      .findOne(
        {
          $or: [{ username }, { phone: username }, { email: username }]
        })
      // .select({ username: 1, avatar: 1, isDelete: 1, password: 1, email: 1, phone: 1 })
      .lean()
      .exec()
  }

  // 统计数量
  async countByCondition(condition: any): Promise<number> {
    return await this.adminModel.countDocuments(condition)
  }

  // 注销
  async signout(userId: string) {
    const client = this.redis.getClient()
    return await client.hdel('Admin_Token', String(userId))
  }

  // 登陆
  async login(username: string, password: string, ip: String) {
    const admin: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!admin) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (admin.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!this.cryptoUtil.checkPassword(password, admin.password)) {
      return { status: 400, code: 4011 };
    }
    const token = await this.jwtService.sign({ id: admin._id, type: 'admin' })
    const client = this.redis.getClient()
    await client.hset('Admin_Token', String(admin._id), token)
    await this.adminModel
      .findByIdAndUpdate(admin._id, { lastLoginTime: new Date(), lastLoginIp: ip })
      .lean()
      .exec()
    delete admin.password
    return { status: 200, code: 2001, data: { token, userinfo: admin } }
  }

  // 发送修改密码邮件
  async sendResetPassEmail(username: string, language: string) {
    const admin: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!admin) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (admin.isDelete) {
      return { status: 400, code: 4024 };
    }
    const mailToken = await this.jwtService.sign({ id: admin._id, type: 'admin' })
    const url = `${this.config.api_url}/admin/passforget`
    const mail = await this.emailUtil.sendResetPassMail(admin.email, mailToken, language, url)
    return mail
  }


  // 发送短信验证码
  async sendPhoneCode(username: string) {
    const admin: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!admin) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (admin.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!admin.phone) {
      return { status: 400, code: 4015 }
    }
    const phone = admin.phone
    const replaceStr = phone.substring(4, 8)
    const str = '*'.repeat(replaceStr.length)
    const telephone = phone.replace(replaceStr, str)
    const msg = await this.phonUtil.sendVerificationCode(phone)
    if (msg) {
      return { status: 200, code: 2049, phone: telephone }
    } else {
      return { status: 400, code: 4042 }
    }
  }

  // 短信验证码校验
  async phoneCodeCheck(username: string, code: string) {
    const admin: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!admin) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (admin.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!admin.phone) {
      return { status: 400, code: 4015 }
    }
    const msg: any = await this.phonUtil.codeCheck(admin.phone, code)
    if (msg.status === 200) {
      msg.token = await this.jwtService.sign({ id: admin._id, type: 'admin' })
    }
    return msg
  }

  // 重置密码
  async resetPassword(username: string, reset: ResetPassDTO) {
    const admin: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!admin) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (admin.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (reset.password !== reset.confirm) {
      return { status: 400, code: 4022 }
    }
    const password = await this.cryptoUtil.encryptPassword(md5(reset.password))
    const msg = await this.jwtService.verify(reset.token);
    if (msg.type === 'admin' && msg.id === String(admin._id)) {
      await this.adminModel.findByIdAndUpdate(admin._id, { password });
      return { status: 200, code: 2012 };
    } else {
      return { status: 400, code: 4008 };
    }
  }

  // 重置密码token校验
  async forgetTokenCheck(token: string, res: any) {
    try {
      await this.jwtService.verify(token)
    } catch (error) {
      return res.redirect(`${this.config.cms_url}/resetpasswordOverTime`);
    }
    return res
      .redirect(`${this.config.cms_url}/resetpassword?token=${token}`);
  }
}