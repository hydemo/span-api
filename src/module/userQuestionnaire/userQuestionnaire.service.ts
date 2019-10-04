import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IUserQuestionnaire } from './userQuestionnaire.interfaces';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { IUserProject } from '../userProject/userProject.interfaces';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';

@Injectable()
export class UserQuestionnaireService {
  constructor(
    @Inject('UserQuestionnaireModelToken') private readonly userQuestionnaireModel: Model<IUserQuestionnaire>,
    @Inject(QuestionnaireService) private readonly questionnaireService: QuestionnaireService,
  ) { }

  // 创建数据
  async create(userQuestionnaire: any): Promise<IUserQuestionnaire> {
    return await this.userQuestionnaireModel.create(userQuestionnaire)
  }

  // 权限校验
  async canActive(id: string, user: string) {
    const userQuestionnaire = await this.userQuestionnaireModel
      .findById(id)
      .populate({ path: 'questionnaire', model: 'questionnaire' })
      .lean()
      .exec()
    if (!userQuestionnaire) {
      throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
    }
    if (String(userQuestionnaire.user) !== String(user)) {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    return userQuestionnaire
  }

  // 根据标签名获取
  async findById(id: string, user: string) {
    const userQuestionnaire = await this.canActive(id, user)
    const questionnaire = userQuestionnaire.questionnaire
    let current = userQuestionnaire.current
    if (current === 'userinfo' && (!questionnaire.userinfo || questionnaire.userinfo.length === 0)) {
      current = 'userfilter'
    }
    if (current === 'userfilter' && (!questionnaire.userinfo || questionnaire.userinfo.length === 0)) {
      current = 'subject'
    }
    if (current !== userQuestionnaire.current) {
      await this.userQuestionnaireModel.findByIdAndUpdate(id, { current })
    }
    return { data: questionnaire, current }
  }

  // 查询全部数据
  async list(userProject: IUserProject) {
    return await this.userQuestionnaireModel
      .find({
        isDelete: false,
        isWithDraw: false,
        isCompleted: false,
        user: userProject.user,
        companyProject: userProject.companyProject
      })
      .populate({ path: 'questionnaire', model: 'questionnaire' })
      .lean()
      .exec()
  }

  // 获取用户信息题
  async getUserinfo(id: string, user: string) {
    const userQuestionnaire = await this.canActive(id, user)
    return await this.questionnaireService.getUserinfo(userQuestionnaire.questionnaire)
  }

  // 获取筛选题
  async getUserfilter(id: string, user: string, subjectNum: number) {
    const userQuestionnaire = await this.canActive(id, user)
    const userfilter = await this.questionnaireService.getUserfilterByUser(userQuestionnaire.questionnaire, subjectNum)
    if (subjectNum > 1 && userfilter.filterType !== 'frequency') {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    if (
      userQuestionnaire.userfilterChoice &&
      userQuestionnaire.userfilterChoice[subjectNum - 2] &&
      userQuestionnaire.userfilterChoice[subjectNum - 2].length > 0
    ) {
      return {
        subjectType: "scale",
        guide: userfilter.guide,
        question: userQuestionnaire.userfilterChoice[subjectNum - 2],
        option: userfilter.option,
        totalPage: userQuestionnaire.questionnaire.userfilter.length
      };
    }
  }
  // 获取主体题
  async getSubject(id: string, user: string) {
    const userQuestionnaire: IUserQuestionnaire = await this.canActive(id, user)
    return await this.questionnaireService.getSubject(userQuestionnaire.questionnaire, userQuestionnaire.choice)
  }
}