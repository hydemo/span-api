import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserAnswer } from './userAnswer.interfaces';

@Injectable()
export class UserAnswerService {
  constructor(
    @Inject('UserAnswerModelToken') private readonly userAnswerModel: Model<IUserAnswer>,

  ) { }

  // 创建数据
  async create(userAnswer: any): Promise<IUserAnswer> {
    return await this.userAnswerModel.create(userAnswer)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.userAnswerModel.findByIdAndDelete(id)
  }

  async aggregate(condition) {
    console.log(condition, 'aa')
    return this.userAnswerModel.aggregate([
      { $match: condition },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1
          },
          avg: {
            $avg: '$completeTime'
          }
        }
      }
    ])
  }
}