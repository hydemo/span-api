import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserProject } from './userProject.interfaces';
// import { CreateUserProjectDTO } from '../userQuestionnaire/userQuestionnaire.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';

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
      .find({ isDelete: false, isCompleted: false, user })
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
    const completeProjects = await this.userProjectModel
      .find({ isDelete: false, isCompleted: true, user })
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
    return { projects, completeProjects }
  }

  // 查询全部数据
  async findById(id: string, user: string) {
    const project = await this.userProjectModel.findById(id)
    if (!project) {
      throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(project.user) !== String(user)) {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    return project
  }

  // 完成计划
  async complete(companyProject: string, user: string) {
    return await this.userProjectModel.findOneAndUpdate({ companyProject, user }, { isCompleted: true })
  }
}