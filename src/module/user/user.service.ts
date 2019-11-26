import { Model } from 'mongoose'
import * as md5 from 'md5'
import * as fs from 'fs'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { IUser } from './user.interfaces'
import { ResetPassDTO, CreateEmployeeDTO } from './user.dto'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'
import { OrganizationService } from '../organization/organization.service';
import { XlsxService } from './xlsx.service';
import { excelTitle } from './title.local'
import { CheckService } from './check.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { ICompany } from '../company/company.interfaces';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserModelToken') private readonly userModel: Model<IUser>,
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
    @Inject(XlsxService) private readonly xlsxService: XlsxService,
    @Inject(CheckService) private readonly checkService: CheckService,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(EmailUtil) private readonly emailUtil: EmailUtil,
    @Inject(PhoneUtil) private readonly phonUtil: PhoneUtil,
    private redis: RedisService,
    private config: ConfigService,

  ) { }

  async upload(path: string, filename: string, id: string) {
    const company = await this.organizationService.findById(id);
    if (!company) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const worksheet = await this.xlsxService.getWorksheet(`${path}/${filename}`);
    const { headers, headerArray, language, length } =
      await this.xlsxService.getTitle(worksheet, excelTitle);
    const users = this.xlsxService.getUsers(worksheet, headers);
    //isleader检验
    const checkIslead = await this.checkService.isLeadCheck(users, length);
    if (checkIslead) {
      return checkIslead;
    }
    //校验user格式
    const checkResult = this.checkService.userFormateCheck(users, language);
    if (checkResult) {
      return checkResult
    }
    //校验用户是否存在
    const exist = await this.checkService.userExistCheck(users, id);
    if (exist) {
      return exist
    }
    const { layers, layerNames } = await this.xlsxService.getLayer(users, headerArray);
    //生成组织架构，并返回组织架构
    const organizations = await this.xlsxService.genOrganization(layers, id);
    const userObjects = await this.xlsxService.genUser(users, layerNames, organizations, company);
    const userInfo = await this.xlsxService.addUsers(userObjects);
    const staffNumber = await this.userModel.countDocuments({ companyId: id, isDelete: false });
    await this.organizationService.findByIdAndUpdate(id, {
      layerLength: layerNames.length,
      staffNumber,
    })
    const xlsxPath = `./temp/upload/excel/${filename}`;
    fs.exists(xlsxPath, (exists) => {
      if (exists)
        fs.unlink(xlsxPath, (err) => {
          console.log(err)
        });
    });
    const data = await this.organizationService.findById(id);
    return {
      status: 200,
      code: 2031,
      data: { ...data, userInfo },
    };
  }

  // 根据id查找
  async findById(id: string): Promise<IUser> {
    return await this.userModel.findById(id).lean().exec()
  }
  // 根据账号查找
  async findByUsername(username: string) {
    return await this.userModel
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
    return await this.userModel.countDocuments(condition)
  }

  // 注销
  async signout(userId: string) {
    const client = this.redis.getClient()
    return await client.hdel('User_Token', String(userId))
  }

  // 登陆
  async login(username: string, password: string, ip: String) {
    const user: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!user) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (user.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!this.cryptoUtil.checkPassword(password, user.password)) {
      return { status: 400, code: 4011 };
    }
    const token = await this.jwtService.sign({ id: user._id, type: 'user' })
    const client = this.redis.getClient()
    await client.hset('User_Token', String(user._id), token)
    await this.userModel
      .findByIdAndUpdate(user._id, { lastLoginTime: new Date(), lastLoginIp: ip })
      .lean()
      .exec()
    delete user.password
    return { status: 200, code: 2001, data: { token, userinfo: user } }
  }

  // 发送修改密码邮件
  async sendResetPassEmail(username: string, language: string) {
    const user: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!user) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (user.isDelete) {
      return { status: 400, code: 4024 };
    }
    const mailToken = await this.jwtService.sign({ id: user._id, type: 'user' })
    const url = `${this.config.api_url}/user/passforget`
    const mail = await this.emailUtil.sendResetPassMail(user.email, mailToken, language, url)
    return mail
  }


  // 发送短信验证码
  async sendPhoneCode(username: string) {
    const user: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!user) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (user.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!user.phone) {
      return { status: 400, code: 4015 }
    }
    const phone = user.phone
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
    const user: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!user) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (user.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (!user.phone) {
      return { status: 400, code: 4015 }
    }
    const msg: any = await this.phonUtil.codeCheck(user.phone, code)
    if (msg.status === 200) {
      msg.token = await this.jwtService.sign({ id: user._id, type: 'user' })
    }
    return msg
  }

  // 重置密码
  async resetPassword(username: string, reset: ResetPassDTO) {
    const user: any = await this.findByUsername(username)
    // 判断账号是否存在
    if (!user) {
      return { status: 400, code: 4013 };
    }
    //判断账号是否被删除
    if (user.isDelete) {
      return { status: 400, code: 4024 };
    }
    if (reset.password !== reset.confirm) {
      return { status: 400, code: 4022 }
    }
    const password = await this.cryptoUtil.encryptPassword(md5(reset.password))
    const msg = await this.jwtService.verify(reset.token);
    if (msg.type === 'user' && msg.id === String(user._id)) {
      await this.userModel.findByIdAndUpdate(user._id, { password });
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

  // 重置密码token校验
  async count(condition: any) {
    return await this.userModel.countDocuments(condition).lean().exec()
  }

  // 根据条件查询
  async findByCondition(condition: any) {
    return await this.userModel.find(condition).lean().exec()
  }
  // 根据条件查询
  async findOneByCondition(condition: any) {
    return await this.userModel.findOne(condition).lean().exec()
  }


  // 获取员工全部信息
  async list(pagination: Pagination, id: string, user: ICompany) {
    const organization = await this.organizationService.findById(id)
    if (!organization) {
      return { list: [], total: 0 }
    }
    if (String(user.companyId) !== String(organization.companyId)) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const company = await this.organizationService.findById(user.companyId)
    if (!company) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    let condition: any = {
      isDelete: false,
      'layerLine.layerId': id
    }
    if (String(id) === String(user.companyId)) {
      condition = {
        isDelete: false,
        companyId: id
      }
    }
    const list = await this.userModel
      .find(condition)
      .sort({ layerId: -1 })
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .populate({ path: 'layerLine.layerId', model: 'organization' })
      .lean()
      .exec()
    const total = await this.userModel.countDocuments(condition).lean().exec()
    return { layerLength: company.layerLength, list, total }
  }

  async getLayerLine(id, layerLine) {
    const organization = await this.organizationService.findById(id)
    if (!organization) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    if (organization.layer === 0) {
      return layerLine
    }
    const newLayer = {
      layerName: organization.name,
      layerId: id,
      parentId: organization.parent,
      layer: organization.layer
    }
    layerLine.unshift(newLayer)
    if (organization.parent) {
      await this.getLayerLine(organization.parent, layerLine)
    }
    return layerLine
  }

  async addEmployee(id: string, employee: CreateEmployeeDTO, user: ICompany) {
    const organization = await this.organizationService.findById(id)
    if (!organization) {
      return { list: [], total: 0 }
    }
    if (String(user.companyId) !== String(organization.companyId)) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const company = await this.organizationService.findById(user.companyId)
    if (!company) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    let layerLine: any = []
    if (String(id) !== String(user.companyId)) {
      layerLine.push({
        layerName: organization.name,
        layerId: id,
        parentId: organization.parent,
        layer: organization.layer
      })
      await this.getLayerLine(organization.parent, layerLine)
    }
    const userObject: any = {
      companyId: company._id,
      companyName: company.name,
      email: employee.email,
      layer: organization.layer,
      layerId: organization._id,
      layerLine,
      isLeader: employee.isLeader,
      "userinfo.fullname": employee.fullname
    };
    if (employee.phone) {

      const userExist = await this.userModel.find({ phone: employee.phone, isDelete: false })
        .lean()
        .exec();
      if (userExist.length) {
        return { status: 400, code: 4032 }
      }
      userObject.phone = employee.phone
    }

    await this.userModel.create(userObject);
    await this.organizationService.findByIdAndUpdate(company._id, {
      $inc: { staffNumber: 1 }
    });
    return { status: 200, code: 2053 }
  }
}