import { Model } from 'mongoose'
import * as _ from 'lodash'
import { Inject, Injectable } from '@nestjs/common'
import { UserProjectService } from '../userProject/userProject.service';
import { CompanyProjectService } from '../companyProject/companyProject.service';
import { UserQuestionnaireService } from '../userQuestionnaire/userQuestionnaire.service';
import { ScaleService } from '../scale/scale.service';
import { IUser } from '../user/user.interfaces';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { ApiException } from 'src/common/expection/api.exception';
import { UserScoreService } from '../userScore/userScore.service';
import { IScale } from '../scale/sacle.interfaces';
import { OrganizationService } from '../organization/organization.service';
import { IUserQuestionnaire } from '../userQuestionnaire/userQuestionnaire.interfaces';

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(CompanyProjectService) private readonly companyProjectService: CompanyProjectService,
    @Inject(UserQuestionnaireService) private readonly userQuestionnaireService: UserQuestionnaireService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
    @Inject(UserScoreService) private readonly userScoreService: UserScoreService,
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
  ) { }

  // 获取可以看反馈的计划列表
  async projects(user: IUser) {
    return await this.companyProjectService.findWithProject({ company: user.companyId, isDelete: false })
  }

  // 获取计划已生成反馈的问卷列表
  async questionnaires(id: any) {
    const companyProject = await this.companyProjectService.findByIdWithProject(id)
    return companyProject.project.questionnaires;
  }

  // 获取问卷的指标详情
  async scales(project: string, questionnaire: string, user: string) {
    const companyProject = await this.companyProjectService.findById(project)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire })
    return await this.scaleService.find({ _id: { $in: setting.scales || [] } })
  }

  // 获取问卷的指标详情
  async leaderPermission(project: string, questionnaire: string, user: string) {
    const companyProject = await this.companyProjectService.findByIdWithProject(project)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire: String(questionnaire) })
    if (setting) {
      return setting.leaderFeedback
    } else {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
  }

  // 我的评价
  async myEvaluation(score: number, scale: IScale) {
    const feedback = scale.feedback
    let evaluation: any
    feedback.map(evaluate => {
      console.log(evaluate, 'ee')
      if (score >= evaluate.lower && score <= evaluate.upper) {
        evaluation = { recommend: evaluate.recommend, evaluation: evaluate.evaluation };
      }
    })
    return evaluation
  }

  // 我的分数
  async myScore(questionnaire: string, companyProject: string, user: string, scale: IScale) {
    const userScoreOfMe = await this.userScoreService.findOneByCondition({
      userId: user,
      companyProject,
      questionnaire,
    })
    if (!userScoreOfMe) {
      return
    }
    const scaleScoreOfMe = _.find(userScoreOfMe.score, { scale: String(scale._id) })
    const userScoreOfCompany = await this.userScoreService.findByCondition({
      companyProject,
      questionnaire,
    })
    const scoreToSort: number[] = []
    userScoreOfCompany.map(userScore => {
      userScore.score.map(score => {
        if (score.scale === String(scale._id)) {
          scoreToSort.push(score.score)
        }
      })
    })
    const scoreSort = scoreToSort.sort().reverse()
    const rank = _.findIndex(scoreSort, scaleScoreOfMe.score) + 1
    let evaluation: any
    if (scale.feedbackType === 'score') {
      evaluation = await this.myEvaluation(scaleScoreOfMe.score, scale)
    } else if (scale.feedbackType === 'rate') {
      evaluation = await this.myEvaluation(rank / scoreSort.length, scale)
    }
    console.log(evaluation, 'vvv')
    return {
      score: scaleScoreOfMe.score,
      rank,
      evaluateNum: userScoreOfMe.evaluateNum,
      evaluation,
    }

  }

  // 我的分数
  async depScore(questionnaire: string, companyProject: string, layerId: string, scale: IScale) {
    console.log(companyProject, questionnaire, layerId)
    const userScoreOfSameDep = await this.userScoreService.findByCondition({
      companyProject,
      questionnaire,
      'layerLine.layerId': layerId
    })
    const scoreArrayOfSameDep: number[] = [];
    userScoreOfSameDep.map(userScore => {
      userScore.score.map(score => {
        if (score.scale === String(scale._id)) {
          scoreArrayOfSameDep.push(score.score)
        }
      })
    })
    const scoreSortOfSameDep = scoreArrayOfSameDep.sort().reverse()
    // const length = scoreSortOfSameDep.length
    return {
      scoreOfSameDep: userScoreOfSameDep,
      // max: scoreSortOfSameDep[0],
      // min: scoreSortOfSameDep[length - 1],
      // median: scoreSortOfSameDep[parseInt(String(length / 2))],
      scoreSort: scoreSortOfSameDep
    }
  }

  async staffFeedback(companyProject: string, questionnaire: string, user: IUser, scale: IScale, setting: any) {
    const me = await this.myScore(questionnaire, companyProject, user._id, scale)
    const result: any = { me, scale }

    if (setting.staffFeedback.sameDep) {
      const sameDep = await this.depScore(
        questionnaire,
        companyProject,
        user.layerId,
        scale,
      )
      const scoreOfSameDep: any[] = []
      await sameDep.scoreOfSameDep.map(same => {
        const scaleScoreOfUser = _.find(same.score, { scale: String(scale._id) })
        if (setting.staffFeedback.sameDepNameVisiable) {
          scoreOfSameDep.push({ username: same.username, score: scaleScoreOfUser.score })
        } else {
          scoreOfSameDep.push({ username: '', score: scaleScoreOfUser.score })
        }
      })
      result.sameDep = {
        scoreOfSameDep,
        scoreSort: sameDep.scoreSort
      }

    }
    if (setting.staffFeedback.otherDep) {
      const otherDep: any = []
      const departments = await this.organizationService.findByCondition({
        companyId: user.companyId,
        layer: user.layer,
        _id: { $ne: user.layerId },
        isDelete: false,
      })
      await Promise.all(departments.map(async (department, index) => {
        const depScore = await this.depScore(
          questionnaire,
          companyProject,
          department._id,
          scale,
        )
        if (depScore.scoreSort.length) {
          otherDep[index] = {
            name: department.name,
            scores: depScore.scoreSort
          }
        }
      }))
      result.otherDep = otherDep.filter(v => v)
    }
    return result
  }

  async leaderFeedback(companyProject: string, questionnaire: string, user: IUser, scale: IScale, departmentId: string) {
    const departmentScore: any = []
    const userScore: any[] = []
    const departments = await this.organizationService.findByCondition({
      companyId: user.companyId,
      isDelete: false,
      parent: departmentId,
    })
    await Promise.all(departments.map(async department => {
      const depScore = await this.depScore(
        questionnaire,
        companyProject,
        department._id,
        scale,
      )
      console.log(depScore, 'aaa')
      if (depScore.scoreSort.length) {
        departmentScore.push({
          name: department.name,
          scores: depScore.scoreSort
        })
      }
    }))
    const userScoreAll = await this.userScoreService.findByCondition({
      companyProject,
      questionnaire,
      layerId: departmentId,
    })
    userScoreAll.map(score => {
      const scaleScore = _.find(score.score, { scale: String(scale._id) })
      userScore.push({
        username: score.username,
        score: scaleScore.score
      })
    })
    return { departmentScore, userScore }
  }

  // 获取指标的反馈详情
  async feedback(project: string, questionnaire: string, scaleId: string, leader: number, user: IUser, departmentId: string) {
    if (leader && (!user.isLeader || !departmentId)) {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const companyProject = await this.companyProjectService.findById(project)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire })
    const index = _.findIndex(setting.scales, function (o) { return String(o) === scaleId });
    console.log(index, 'in')
    if (index < 0) {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    const scale = await this.scaleService.findById(scaleId)
    if (!leader) {
      return await this.staffFeedback(project, questionnaire, user, scale, setting)
    } else {
      return await this.leaderFeedback(project, questionnaire, user, scale, departmentId)
    }
  }
}