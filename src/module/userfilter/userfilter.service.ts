import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserfilter } from './userfilter.interfaces';
import { CreateUserfilterDTO } from './userfilter.dto';
import { Pagination } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserfilterService {
  constructor(
    @Inject('UserfilterModelToken') private readonly userfilterModel: Model<IUserfilter>,

  ) { }

  // 创建数据
  async create(userfilter: any): Promise<IUserfilter> {
    return await this.userfilterModel.create(userfilter)
  }

  /**
   * ----{通过条件查找单个筛选题目}----
   * @param {String} id 查找条件对象
   * @returns {Promise} promise 
   * @author:oy 
   */
  async getUserfilter(id) {
    return await this.userfilterModel.findById(id)
      .populate({ path: 'scale', model: 'scale' })
      .lean()
      .exec();
  }
  // 删除数据
  async deleteById(id: string) {
    return await this.userfilterModel.findByIdAndDelete(id)
  }
}