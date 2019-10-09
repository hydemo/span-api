import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IOrganizationScore } from './organizationScore.interfaces';
import { CreateOrganizationScoreDTO } from './organizationScore.dto';

@Injectable()
export class OrganizationScoreService {
  constructor(
    @Inject('OrganizationScoreModelToken') private readonly organizationScoreModel: Model<IOrganizationScore>,

  ) { }

  // 创建数据
  async create(organizationScore: any): Promise<IOrganizationScore> {
    return await this.organizationScoreModel.create(organizationScore)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.organizationScoreModel.findByIdAndDelete(id)
  }

  // 根据条件查询
  async findByCondition(condition: any) {
    return await this.organizationScoreModel.find(condition).lean().exec()
  }

  // 根据条件查询
  async findOneByCondition(condition: any) {
    return await this.organizationScoreModel.findOne(condition).lean().exec()
  }


  // 根据id更新
  async findByIdAndUpdate(id: string, update: any) {
    return await this.organizationScoreModel.findByIdAndUpdate(id, update).lean().exec()
  }
}