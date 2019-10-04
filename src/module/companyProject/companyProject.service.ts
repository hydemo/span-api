import { Model } from 'mongoose'
import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { EmailUtil } from 'src/utils/email.util'
import { ConfigService } from 'src/config/config.service'
import { PhoneUtil } from 'src/utils/phone.util'
import { ICompanyProject } from './companyProject.interfaces';
import { CreateCompanyProjectDTO } from './companyProject.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { ICompany } from '../company/company.interfaces';
import { UserService } from '../user/user.service';
import { UserQuestionnaireService } from '../userQuestionnaire/userQuestionnaire.service';
import { UserProjectService } from '../userProject/userProject.service';

@Injectable()
export class CompanyProjectService {
  constructor(
    @Inject('CompanyProjectModelToken') private readonly companyProjectModel: Model<ICompanyProject>,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(UserQuestionnaireService) private readonly userQuestionnaireService: UserQuestionnaireService,
  ) { }

  // 创建数据
  async create(companyProject: any) {
    return await this.companyProjectModel.create(companyProject)
  }

  // 根据标签名获取
  async getCompanyProject(companyProject: string): Promise<ICompanyProject | null> {
    return await this.companyProjectModel.findOne({ companyProject })
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
  //   const company = await this.companyProjectModel.findById(id);
  //   // if (
  //   //   req.currentAdmin.isProfessor &&
  //   //   String(req.currentAdmin._id) !== company.producerId
  //   // )
  //   //   return res.sendStatus(403);
  //   // if (company.ownerId) {
  //   //   await account.removeAdminTruely(company.ownerId);
  //   // }
  //   await this.companyProjectModel.findByIdAndDelete(id);
  //   return { status: 200, code: 2025 }
  // }

  // 查询全部数据
  async list(pagination: Pagination) {
    const search = [{ companyProject: new RegExp(pagination.value || '', "i") }];
    const condition = { $or: search };
    return await this.companyProjectModel.find(condition)
      .limit(500)
      .sort({ companyProject: 1 })
      .select({ companyProject: 1 })
      .lean()
      .exec();
  }

  // 查询全部数据
  async findOne(condition: any) {
    return await this.companyProjectModel.findOne(condition).lean().exec()
  }

  async acceptProject(id: string, company: ICompany, questionnaires: any) {
    console.log(questionnaires, 'ss')
    const exist = await this.companyProjectModel.findOne({ isWithDraw: false, isDelete: false, company: company.companyId, project: id })
    if (exist) {
      return { status: 200, code: 40002, msg: 'project exist' }
    }
    const companyProject = await this.companyProjectModel.create({ project: id, company: company.companyId, questionnaireSetting: questionnaires })
    const client = await this.redis.getClient()
    for (let questionnaire of questionnaires) {
      await Promise.all(questionnaire.rater.map(async rater => {

        let condition: any = { 'layerLine.layerId': rater, isDelete: false }
        if (String(rater) === String(company.companyId)) {
          condition = { companyId: rater, isDelete: false }
        }
        if (questionnaire.raterType === 'leader') {
          condition.isLeader = true
        } else if (questionnaire.raterType === 'staff') {
          condition.isLeader = false
        }
        const users = await this.userService.findByCondition(condition)
        await Promise.all(users.map(async user => {
          await this.userQuestionnaireService.create({
            user,
            project: id,
            companyProject: companyProject._id,
            choice: [],
            projectStartTime: questionnaire.startTime,
            projectEndTime: questionnaire.endTime,
            questionnaire: questionnaire.questionnaire,
          })
          await client.hset(`userProject_${id}`, user._id, 1)
        }))
      }))
    }
    const userProjects = await client.hkeys(`userProject_${id}`)
    await Promise.all(userProjects.map(async key => {
      await this.userProjectService.create({
        user: key,
        project: id,
        companyProject: companyProject._id
      })
    }))
    return { status: 200 }
  }

}