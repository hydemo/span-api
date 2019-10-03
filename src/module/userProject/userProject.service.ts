import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserProject } from './userProject.interfaces';
// import { CreateUserProjectDTO } from '../userQuestionnaire/userQuestionnaire.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';

@Injectable()
export class UserProjectService {
  constructor(
    @Inject('UserProjectModelToken') private readonly userProjectModel: Model<IUserProject>,

  ) { }

  // 创建数据
  async create(userProject: any) {
    return await this.userProjectModel.create(userProject)
  }

  // 根据标签名获取
  async getUserProject(userProject: string): Promise<IUserProject | null> {
    return await this.userProjectModel.findOne({ userProject })
  }

  // 查询全部数据
  async list(user: string) {
    const projects = await this.userProjectModel
      .find({ isDelete: false, isCompleted: false })
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
    const completeProjects = await this.userProjectModel
      .find({ isDelete: false, isCompleted: true })
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
    return { projects, completeProjects }
  }

}