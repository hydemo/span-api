import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserScore } from './userScore.interfaces';
import { CreateUserScoreDTO } from './userScore.dto';

@Injectable()
export class UserScoreService {
  constructor(
    @Inject('UserScoreModelToken') private readonly userScoreModel: Model<IUserScore>,

  ) { }

  // 创建数据
  async create(userScore: any): Promise<IUserScore> {
    return await this.userScoreModel.create(userScore)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.userScoreModel.findByIdAndDelete(id)
  }

  // 根据条件查询
  async findByCondition(condition: any) {
    return await this.userScoreModel.find(condition).lean().exec()
  }

  // 根据条件查询
  async findOneByCondition(condition: any) {
    return await this.userScoreModel.findOne(condition).lean().exec()
  }

  // 根据id更新
  async findByIdAndUpdate(id: string, update: any) {
    return await this.userScoreModel.findByIdAndUpdate(id, update).lean().exec()
  }
}