import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserinfo } from './userinfo.interfaces';
import { CreateUserinfoDTO } from './userinfo.dto';
import { Pagination } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserinfoService {
  constructor(
    @Inject('UserinfoModelToken') private readonly userinfoModel: Model<IUserinfo>,

  ) { }

  // 创建数据
  async create(userinfo: any): Promise<IUserinfo> {
    return await this.userinfoModel.create(userinfo)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.userinfoModel.findByIdAndDelete(id)
  }
}