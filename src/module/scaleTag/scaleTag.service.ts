import { Model } from 'mongoose'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'
import { ITag } from './scaleTag.interfaces';
import { CreateTagDTO } from './scaleTag.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';

@Injectable()
export class TagService {
  constructor(
    @Inject('TagModelToken') private readonly tagModel: Model<ITag>,

  ) { }

  // 创建数据
  async create(tag: string) {
    const createTag: CreateTagDTO = { tag }
    return await this.tagModel.create(createTag)
  }

  // 根据标签名获取
  async getTag(tag: string): Promise<ITag | null> {
    return await this.tagModel.findOne({ tag })
  }

  // // 删除企业
  // async deleteCompany(id: string) {
  //   // const users = await User
  //   //   .listUser({ companyId: id })
  //   //   .lean()
  //   //   .exec()
  //   // if (users.length) {
  //   //   for (let userInfo of users) {
  //   //     await user.deleteUser(userInfo._id);
  //   //     delete userInfo._v
  //   //     userInfo.deleteReason = '企业删除';
  //   //     await user.createDeleteUser(userInfo);
  //   //   }
  //   // }
  //   const company = await this.tagModel.findById(id);
  //   // if (
  //   //   req.currentAdmin.isProfessor &&
  //   //   String(req.currentAdmin._id) !== company.producerId
  //   // )
  //   //   return res.sendStatus(403);
  //   // if (company.ownerId) {
  //   //   await account.removeAdminTruely(company.ownerId);
  //   // }
  //   await this.tagModel.findByIdAndDelete(id);
  //   return { status: 200, code: 2025 }
  // }

  // 查询全部数据
  async list(pagination: Pagination) {
    const search = [{ tag: new RegExp(pagination.value || '', "i") }];
    const condition = { $or: search };
    return await this.tagModel.find(condition)
      .limit(500)
      .sort({ tag: 1 })
      .select({ tag: 1 })
      .lean()
      .exec();
  }

}