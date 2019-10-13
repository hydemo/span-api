import { Model } from 'mongoose'
import * as _ from 'lodash'
import { Inject, Injectable } from '@nestjs/common'
import { UserProjectService } from '../userProject/userProject.service';
import { CompanyProjectService } from '../companyProject/companyProject.service';
import { UserQuestionnaireService } from '../userQuestionnaire/userQuestionnaire.service';
import { ScaleService } from '../scale/scale.service';

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(CompanyProjectService) private readonly companyProjectService: CompanyProjectService,
    @Inject(UserQuestionnaireService) private readonly userQuestionnaireService: UserQuestionnaireService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
  ) { }
  // 获取计划已生成反馈的问卷列表
  async questionnaires(id: any, user: string) {
    const userProject = await this.userProjectService.findById(id, user)
    const userQuestionnaires = await this.userQuestionnaireService
      .find(
        { user, companyProject: userProject.companyProject, isCompleted: true },
        { path: 'questionnaire', model: 'questionnaire' }
      )
    return userQuestionnaires
  }

  // 获取问卷的指标详情
  async scales(id: string, user: string) {
    const userQuestionnaire = await this.userQuestionnaireService.canActive(id, user)
    const companyProject = await this.companyProjectService.findById(userQuestionnaire.companyProject)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire: String(userQuestionnaire.questionnaire._id) })
    return await this.scaleService.find({ _id: { $in: setting.scales } })
  }

}