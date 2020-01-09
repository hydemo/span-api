import { Model } from 'mongoose'
import * as mongoose from 'mongoose';

import { RedisService } from 'nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'
import { ICompanyProject } from './companyProject.interfaces';
import { Pagination } from 'src/common/dto/pagination.dto';
import { ICompany } from '../company/company.interfaces';
import { UserService } from '../user/user.service';
import { UserQuestionnaireService } from '../userQuestionnaire/userQuestionnaire.service';
import { UserProjectService } from '../userProject/userProject.service';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { UserAnswerService } from '../userAnswer/userAnswer.service'
import { EmailUtil } from 'src/utils/email.util';
import { UserResultService } from '../userQuestionnaire/userResult.service';
import { TestEmailContentDTO } from './companyProject.dto';

@Injectable()
export class CompanyProjectService {
  constructor(
    @Inject('CompanyProjectModelToken') private readonly companyProjectModel: Model<ICompanyProject>,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(EmailUtil) private readonly emailUtil: EmailUtil,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(UserAnswerService) private readonly userAnswerService: UserAnswerService,
    @Inject(UserQuestionnaireService) private readonly userQuestionnaireService: UserQuestionnaireService,
    @Inject(UserResultService) private readonly userResultService: UserResultService,
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
      .sort({ companyProject: 1 })
      .lean()
      .exec();
  }

  // 查询全部数据
  async myProjects(pagination: Pagination, user: ICompany) {
    const condition = { company: user.companyId };
    return await this.companyProjectModel.find(condition)
      .limit(500)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ createdAt: -1 })
      .populate({ path: 'project', model: 'project', populate: { path: 'questionnaires.questionnaireId', model: 'questionnaire' } })
      .lean()
      .exec();
  }

  // 根据条件查询单条数据
  async findOne(condition: any) {
    return await this.companyProjectModel.findOne(condition).lean().exec()
  }

  // 根据条件查询数据
  async find(condition: any) {
    return await this.companyProjectModel.find(condition).lean().exec()
  }

  // 根据条件查询数据
  async findWithProject(condition: any) {
    return await this.companyProjectModel
      .find(condition)
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
  }

  // 根据id查询单条数据
  async findById(id: string): Promise<ICompanyProject> {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
    }
    return companyProject
  }

  // 根据id查询单条数据
  async findByIdWithProject(id: string): Promise<ICompanyProject> {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .populate({ path: 'project', model: 'project' })
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
    }
    return companyProject
  }


  async acceptProject(id: string, company: ICompany, questionnaires: any) {
    const exist = await this.companyProjectModel.findOne({ isWithDraw: false, isDelete: false, company: company.companyId, project: id })
    if (exist) {
      throw new ApiException('计划已存在', ApiErrorCode.NO_PERMISSION, 403)
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
    await client.del(`userProject_${id}`)
    return { status: 200 }
  }

  // 计划进度
  async progress(id: string, questionnaire: string, user: ICompany) {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(companyProject.company) !== String(user.companyId)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }
    const exist = companyProject.questionnaireSetting.find(o => o.questionnaire === questionnaire)
    if (!exist) {
      throw new ApiException('问卷有误', ApiErrorCode.NO_PERMISSION, 403)
    }
    const completeNum = await this.userQuestionnaireService.count({
      companyProject: id,
      questionnaire,
      isCompleted: true
    });
    const total = await this.userQuestionnaireService.count({
      companyProject: id,
      questionnaire,
    });
    const userResult = await this.userAnswerService.aggregate({
      companyProject: mongoose.Types.ObjectId(id),
      questionnaire: mongoose.Types.ObjectId(questionnaire),
    });
    let completeAverage = 0;
    let evaluateNum = 0;
    if (userResult.length) {
      completeAverage = userResult[0].avg.toFixed(3);
      evaluateNum = userResult[0].count;
    }
    return {
      total,
      completeNum,
      completeAverage,
      evaluateNum
    };
  }

  // 计划进度
  async download(id: string, questionnaire: string, user: ICompany) {
    console.log(user, 'user')
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(companyProject.company) !== String(user.companyId)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }
    return await this.userResultService.download(companyProject, questionnaire)
  }

  async updateProject(id: string, questionnaireId: string, questionnaire: any, user: ICompany) {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(companyProject.company) !== String(user.companyId)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }

    const exist = companyProject.questionnaireSetting.find(o => o.questionnaire === questionnaireId)
    if (!exist) {
      throw new ApiException('问卷有误', ApiErrorCode.NO_PERMISSION, 403)
    }
    console.log(questionnaire, 'ddd')
    exist.leaderFeedback = questionnaire.leaderFeedback
    exist.staffFeedback = questionnaire.staffFeedback
    await this.companyProjectModel.findByIdAndUpdate(id, { questionnaireSetting: companyProject.questionnaireSetting })
  }


  async sendNotice(id: string, user: ICompany, content: string) {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(companyProject.company) !== String(user.companyId)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }
    const userProjects = await this.userProjectService.findByCondition({ companyProject: id })
    userProjects.map(user => this.emailUtil.sendProjectNotify(user.user.email, content))
    return
  }

  async sendNoticeTest(id: string, user: ICompany, emailDTO: TestEmailContentDTO) {
    // const companyProject: ICompanyProject = await this.companyProjectModel
    //   .findById(id)
    //   .lean()
    //   .exec()
    // if (!companyProject) {
    //   throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    // }
    // if (String(companyProject.company) !== String(user.companyId)) {
    //   throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    // }
    // const userProjects = await this.userProjectService.findByCondition({ companyProject: id })
    // userProjects.map(user => this.emailUtil.sendNotice(user.user.email, content))
    await this.emailUtil.sendProjectNotify(emailDTO.email, emailDTO.content)
    return
  }

  async sendUnComplete(id: string, user: ICompany, content: string) {
    const companyProject: ICompanyProject = await this.companyProjectModel
      .findById(id)
      .lean()
      .exec()
    if (!companyProject) {
      throw new ApiException('计划不存在', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(companyProject.company) !== String(user.companyId)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }
    const userProjects = await this.userProjectService.findByCondition({ companyProject: id, isCompleted: false })
    userProjects.map(user => this.emailUtil.sendNotice(user.user.email, content))
    return
  }
}