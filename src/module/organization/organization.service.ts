import { Model } from 'mongoose'
import * as md5 from 'md5'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'
import { IOrganization } from './organization.interfaces';
import { CreateOrganizationDTO } from './organization.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IList } from 'src/common/interface/list.interface';
import { IAdmin } from '../admin/admin.interfaces';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject('OrganizationModelToken') private readonly organizationModel: Model<IOrganization>,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(EmailUtil) private readonly emailUtil: EmailUtil,
    @Inject(PhoneUtil) private readonly phonUtil: PhoneUtil,
    private redis: RedisService,
    private config: ConfigService,

  ) { }

  // 创建数据
  async create(name: string, admin: IAdmin) {
    const company: CreateOrganizationDTO = {
      name,
      layer: 0,
      layerName: name,
      producerId: admin._id
    };
    const companyExist = await this.organizationModel.findOne({ name, isDelete: false });
    if (companyExist) {
      return { status: 400, code: 4033, organization: companyExist };
    }
    const newCompany = await this.organizationModel.create(company);
    newCompany.companyId = newCompany._id
    await newCompany.save()
    return { status: 200, code: 2020, organization: newCompany };
  }

  // 创建数据
  async existCheck(name: string) {
    const companyExist = await this.organizationModel.findOne({ name, isDelete: false });
    if (companyExist) {
      return { status: 400, code: 4033, organization: companyExist };
    }
    return { status: 200 };
  }

  // 删除企业
  async deleteCompany(id: string) {
    // const users = await User
    //   .listUser({ companyId: id })
    //   .lean()
    //   .exec()
    // if (users.length) {
    //   for (let userInfo of users) {
    //     await user.deleteUser(userInfo._id);
    //     delete userInfo._v
    //     userInfo.deleteReason = '企业删除';
    //     await user.createDeleteUser(userInfo);
    //   }
    // }
    const company = await this.organizationModel.findById(id);
    // if (
    //   req.currentAdmin.isProfessor &&
    //   String(req.currentAdmin._id) !== company.producerId
    // )
    //   return res.sendStatus(403);
    // if (company.ownerId) {
    //   await account.removeAdminTruely(company.ownerId);
    // }
    await this.organizationModel.findByIdAndDelete(id);
    return { status: 200, code: 2025 }
  }

  // 查询全部数据
  async findAll(pagination: Pagination) {
    const condition: any = {};
    const list = await this.organizationModel
      .find(condition)
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ status: 1 })
      .select({ children: 0 })
      .lean()
      .exec();
    const total = await this.organizationModel.countDocuments(condition);
    return { companys: list, total };
  }

}