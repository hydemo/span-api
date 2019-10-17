import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserLink } from './userLink.interfaces';

@Injectable()
export class UserLinkService {
  constructor(
    @Inject('UserLinkModelToken') private readonly userLinkModel: Model<IUserLink>,

  ) { }

  // 创建数据
  async create(userLink: any): Promise<IUserLink> {
    return await this.userLinkModel.create(userLink)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.userLinkModel.findByIdAndDelete(id)
  }

  // 根据条件查询
  async findByCondition(condition: any) {
    return await this.userLinkModel.find(condition).lean().exec()
  }

  // 根据条件查询
  async findByConditionWithUser(condition: any) {
    return await this.userLinkModel.find(condition).populate({ path: 'user', model: 'user' }).lean().exec()
  }

  // 根据条件查询
  async findOneByCondition(condition: any) {
    return await this.userLinkModel.findOne(condition).lean().exec()
  }

  // 根据id更新
  async findByIdAndUpdate(id: string, update: any) {
    return await this.userLinkModel.findByIdAndUpdate(id, update).lean().exec()
  }
}