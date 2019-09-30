import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserQuestionnaire } from './userQuestionnaire.interfaces';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';

@Injectable()
export class UserQuestionnaireService {
  constructor(
    @Inject('UserQuestionnaireModelToken') private readonly userQuestionnaireModel: Model<IUserQuestionnaire>,

  ) { }

  // 创建数据
  async create(userQuestionnaire: any) {
    return await this.userQuestionnaireModel.create(userQuestionnaire)
  }

  // 根据标签名获取
  async getUserQuestionnaire(userQuestionnaire: string): Promise<IUserQuestionnaire | null> {
    return await this.userQuestionnaireModel.findOne({ userQuestionnaire })
  }

  // 查询全部数据
  async list(pagination: Pagination, user: string) {
    const search = [{ userQuestionnaire: new RegExp(pagination.value || '', "i") }];
    const condition = { $or: search };
    return await this.userQuestionnaireModel.find(condition)
      .limit(500)
      .sort({ userQuestionnaire: 1 })
      .select({ userQuestionnaire: 1 })
      .lean()
      .exec();
  }

}