import { Model } from 'mongoose'
import * as md5 from 'md5'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { ICompany } from './company.interfaces'
import { CreateCompanyDTO, CompanyResetPassDTO } from './company.dto'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class CompanyService {
  constructor(
    @Inject('CompanyModelToken') private readonly companyModel: Model<ICompany>,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(EmailUtil) private readonly emailUtil: EmailUtil,
    @Inject(PhoneUtil) private readonly phonUtil: PhoneUtil,
    @Inject(OrganizationService) private readonly organazationService: OrganizationService,
    private redis: RedisService,
    private config: ConfigService,

  ) { }

  // 创建数据
  async register(createCompanyDTO: CreateCompanyDTO) {
    const phoneExist = await this.companyModel.findOne({ phone: createCompanyDTO.phone, isDelete: false })
    if (phoneExist) {
      throw new ApiException('手机号已被注册', ApiErrorCode.PHONE_EXIST, 406)
    }
    const emailExist = await this.companyModel.findOne({ email: createCompanyDTO.email, isDelete: false })
    if (emailExist) {
      throw new ApiException('邮箱已被注册', ApiErrorCode.EMAIL_EXIST, 406)
    }
    const data = await this.phonUtil.codeCheck(createCompanyDTO.phone, createCompanyDTO.code)
    if (data.status !== 200) {
      return data
    }
    createCompanyDTO.password = await this.cryptoUtil.encryptPassword(createCompanyDTO.password)
    const companyCheck = await this.organazationService.existCheck(createCompanyDTO.companyName)
    if (companyCheck.status === 400) {
      return companyCheck
    }
    const company: ICompany = await this.companyModel.create({ ...createCompanyDTO, addTime: Date.now() })
    const newOrganization = await this.organazationService.create(createCompanyDTO.companyName, company)
    company.companyId = newOrganization.organization._id
    await company.save()
    // 新账号创建
  }

  // 根据id查找
  async findById(id: string): Promise<ICompany> {
    return await this.companyModel.findById(id).lean().exec()
  }
  // 根据账号查找
  async findByUsername(username: string) {
    return await this.companyModel
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
    return await this.companyModel.countDocuments(condition)
  }

  // 注销
  async signout(userId: string) {
    const client = this.redis.getClient()
    return await client.hdel('Company_Token', String(userId))
  }

  // 登陆
  async login(username: string, password: string, ip: String) {
    const company: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!company) {
      throw new ApiException('账号不存在', ApiErrorCode.NO_EXIST, 404)
    }
    //判断账号是否被删除
    if (company.isDelete) {
      throw new ApiException('账号已删除', ApiErrorCode.NO_EXIST, 404)
    }
    if (!this.cryptoUtil.checkPassword(password, company.password)) {
      throw new ApiException('密码有误', ApiErrorCode.PASSWORD_INVALID, 406)
    }
    const token = await this.jwtService.sign({ id: company._id, type: 'company' })
    const client = this.redis.getClient()
    await client.hset('Company_Token', String(company._id), token)
    await this.companyModel
      .findByIdAndUpdate(company._id, { lastLoginTime: new Date(), lastLoginIp: ip })
      .lean()
      .exec()
    delete company.password
    return { status: 200, code: 2001, data: { token, userinfo: company } }
  }

  // 发送修改密码邮件
  async sendResetPassEmail(username: string, language: string) {
    const company: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!company) {
      throw new ApiException('账号不存在', ApiErrorCode.NO_EXIST, 404)
    }
    //判断账号是否被删除
    if (company.isDelete) {
      throw new ApiException('账号已删除', ApiErrorCode.NO_EXIST, 404)
    }
    const mailToken = await this.jwtService.sign({ id: company._id, type: 'company' })
    const url = `${this.config.company_url}/#/password?token=${mailToken}`
    const mail = await this.emailUtil.sendResetPassMail(company.email, mailToken, language, url)
    return mail
  }


  // 发送短信验证码
  async sendPhoneCode(username: string) {
    const company: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!company) {
      throw new ApiException('账号不存在', ApiErrorCode.NO_EXIST, 404)
    }
    //判断账号是否被删除
    if (company.isDelete) {
      throw new ApiException('账号已删除', ApiErrorCode.NO_EXIST, 404)
    }
    if (!company.phone) {
      throw new ApiException('账号有误', ApiErrorCode.NO_EXIST, 404)
    }
    const phone = company.phone
    const replaceStr = phone.substring(4, 8)
    const str = '*'.repeat(replaceStr.length)
    const telephone = phone.replace(replaceStr, str)
    const msg = await this.phonUtil.sendVerificationCode(phone)
    if (msg) {
      return { status: 200, code: 2049, phone: telephone }
    } else {
      throw new ApiException('发送失败', ApiErrorCode.INTERNAL_ERROR, 406)
    }
  }

  // 注销
  async getPhoneCode(phone: string) {
    const replaceStr = phone.substring(4, 8)
    const str = '*'.repeat(replaceStr.length)
    const telephone = phone.replace(replaceStr, str)
    const msg = await this.phonUtil.sendVerificationCode(phone)
    if (msg) {
      return { status: 200, code: 2049, phone: telephone }
    } else {
      throw new ApiException('发送失败', ApiErrorCode.INTERNAL_ERROR, 406)
    }
  }

  // 短信验证码校验
  async phoneCodeCheck(username: string, code: string) {
    const company: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!company) {
      throw new ApiException('账号不存在', ApiErrorCode.NO_EXIST, 404)
    }
    //判断账号是否被删除
    if (company.isDelete) {
      throw new ApiException('账号已删除', ApiErrorCode.NO_EXIST, 404)
    }
    if (!company.phone) {
      throw new ApiException('账号有误', ApiErrorCode.NO_EXIST, 404)
    }
    const msg: any = await this.phonUtil.codeCheck(company.phone, code)
    if (msg.status === 200) {
      msg.token = await this.jwtService.sign({ id: company._id, type: 'company' })
    }
    return msg
  }

  // 重置密码
  async resetPassword(reset: CompanyResetPassDTO) {
    const password = await this.cryptoUtil.encryptPassword(reset.password)
    const msg = await this.jwtService.verify(reset.token);
    if (msg.type === 'company') {
      await this.companyModel.findByIdAndUpdate(msg.id, { password });
      return { status: 200, code: 2012 };
    } else {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 404)
    }
  }

  // 重置密码token校验
  async forgetTokenCheck(token: string, res: any) {
    try {
      await this.jwtService.verify(token)
    } catch (error) {
      return res.redirect(`${this.config.company_url}/resetpasswordOverTime`);
    }
    return res
      .redirect(`${this.config.company_url}/#/password?token=${token}`);
  }
}