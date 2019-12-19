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
import { ICompany } from '../company/company.interfaces';
import { UserService } from '../user/user.service';

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

  // 创建子集
  async creatSub(sub: any) {
    return await this.organizationModel.create(sub)
  }

  // 创建数据
  async existCheck(name: string) {
    const companyExist = await this.organizationModel.findOne({ name, isDelete: false });
    if (companyExist) {
      return { status: 400, code: 4033, organization: companyExist };
    }
    return { status: 200 };
  }

  // 创建数据
  async findById(id: string): Promise<IOrganization | null> {
    return await this.organizationModel.findById(id).lean().exec()
  }

  // 创建数据
  async findByIdWithChildren(id: string): Promise<IOrganization | null> {
    return await this.organizationModel.findById(id).lean().exec()
  }

  // 创建数据
  async findOneByCondition(condition: any): Promise<IOrganization | null> {
    return await this.organizationModel.findOne(condition).lean().exec()
  }

  // 创建数据
  async findByCondition(condition: any): Promise<IOrganization[]> {
    return await this.organizationModel.find(condition).lean().exec()
  }

  // 创建数据
  async findByIdAndUpdate(id: string, update: any): Promise<IOrganization | null> {
    return await this.organizationModel.findByIdAndUpdate(id, update).lean().exec()
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

  // 企业账号获取公司详情
  async getByCompany(company: string) {
    return await this.organizationModel
      .findById(company)
      .populate({ path: 'children', model: 'organization', select: '-children' })
      .lean()
      .exec()
  }

  // 企业账号获取公司子集
  async getChildrenByCompany(parent: string) {
    return await this.organizationModel
      .find({ parent, isDelete: false })
      .select({ children: 0 })
      .lean()
      .exec()
  }

  // 添加子节点
  async addChildren(parentId: string, name: string) {
    const exist = await this.organizationModel.findOne({
      name,
      parent: parentId,
    });
    if (!exist) {
      const parent = await this.organizationModel.findById(parentId);
      if (!parent) {
        throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
      }
      const org = {
        companyId: parent.companyId,
        name,
        layer: parent.layer + 1,
        parent,
        children: [],
      }
      const company = await this.organizationModel.findById(parent.companyId);
      if (company && company.layerLength < parent.layer + 1) {
        await this.organizationModel
          .findByIdAndUpdate(parent.companyId, { layerLength: parent.layer + 1 })
      }
      const child = await this.organizationModel.create(org);
      await this.organizationModel.findByIdAndUpdate(parent, { $addToSet: { children: child._id }, hasChildren: true });
      return { status: 200, child };
    } else {
      return { status: 400, code: 4254 }
    }
  }

  // 节点重命名
  async rename(id: string, name: string) {
    const currentOrg = await this.organizationModel.findById(id);
    if (!currentOrg) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const exist = await this.organizationModel.findOne({
      name: name,
      parent: currentOrg.parent,
      _id: { $ne: id },
    });
    if (exist) {
      return { status: 400, code: 2054 };
    } else {

      await this.organizationModel.findByIdAndUpdate(id, { name })
    }
    return { status: 200 };
  }

  // 节点重命名
  async deleteNode(id: string) {
    const orgNode = await this.organizationModel.findById(id);
    if (!orgNode) {
      return { status: 200 }
    }
    if (orgNode.layer === 0) {
      throw new ApiException('企业无法删除', ApiErrorCode.NO_PERMISSION, 403)
    }
    if (orgNode.parent) {
      await this.updateParent(orgNode.parent, orgNode._id)
    }
    await this.deleteChildren(id)
    return await this.organizationModel.findByIdAndDelete(id)
  }

  // 更新父节点
  async updateParent(id: string, child: string) {
    const parent = await this.organizationModel.findById(id)
    if (!parent) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    let hasChildren = parent.children.length === 1 ? false : true
    await this.organizationModel.findByIdAndUpdate(id, { $pull: { children: child }, hasChildren })
  }

  // 删除子节点
  async deleteChildren(parent: string) {
    const children: IOrganization[] = await this.organizationModel.find({ parent })
    return await Promise.all(children.map(async child => {
      if (child.hasChildren) {
        await this.deleteChildren(child._id)
      }
      return await this.organizationModel.findByIdAndDelete(child._id)
    }))
  }
}