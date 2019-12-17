import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'
import * as moment from 'moment'
import { IUserQuestionnaire } from './userQuestionnaire.interfaces';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { IUserProject } from '../userProject/userProject.interfaces';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { UserInfoAnswerDTO, UserfilterDTO } from './userQuestionnaire.dto';
import { IQuestionnaire } from '../questionnaire/questionnaire.interfaces';
import { IUser } from '../user/user.interfaces';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { ProjectService } from '../project/project.service';
import { UserScoreService } from '../userScore/userScore.service';
import { UserAnswerService } from '../userAnswer/userAnswer.service';
import { OrganizationScoreService } from '../organizationScore/organizationScore.service';
import { ScaleService } from '../scale/scale.service';
import { IScale } from '../scale/sacle.interfaces';
import { UserProjectService } from '../userProject/userProject.service';
import { UserLinkService } from '../userLink/userLink.service';

@Injectable()
export class UserQuestionnaireService {
  constructor(
    @Inject('UserQuestionnaireModelToken') private readonly userQuestionnaireModel: Model<IUserQuestionnaire>,
    @Inject(QuestionnaireService) private readonly questionnaireService: QuestionnaireService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
    @Inject(ProjectService) private readonly projectService: ProjectService,
    @Inject(UserScoreService) private readonly userScoreService: UserScoreService,
    @Inject(UserAnswerService) private readonly userAnswerService: UserAnswerService,
    @Inject(OrganizationScoreService) private readonly organizationScoreService: OrganizationScoreService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(UserLinkService) private readonly userLinkService: UserLinkService,
  ) { }

  // 创建数据
  async create(userQuestionnaire: any): Promise<IUserQuestionnaire> {
    return await this.userQuestionnaireModel.create(userQuestionnaire)
  }

  // 计数
  async count(condition: any): Promise<number> {
    return await this.userQuestionnaireModel.countDocuments(condition)
  }

  // 计数
  async find(condition: any, populate?: any): Promise<IUserQuestionnaire[]> {
    return await this.userQuestionnaireModel.find(condition).populate(populate).lean().exec()
  }

  // 权限校验
  async canActive(id: string, user: string): Promise<IUserQuestionnaire> {
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

  // 获取评价对象
  async getRatee(type: number, user: IUser) {
    let choice;
    let rateeType: any = 'user';
    let ratees: any = []
    switch (type) {
      //下级领导
      case 0:
        {
          const organization = await this.organizationService.findById(user.layerId);
          if (!organization) {
            return
          }
          ratees = await this.userService.findByCondition({
            isDelete: false,
            layerId: {
              $in: organization.children
            },
            isLeader: true
          })

        }
        break;
      //下级员工
      case 1:
        {
          ratees = await this.userService.findByCondition({
            isDelete: false,
            "layerLine.layerId": user.layerId,
            isLeader: false
          })
        }
        break;
      //同级领导
      case 2:
        {
          const organization = await this.organizationService.findById(
            user.layerId
          );
          if (!organization) {
            return
          }
          if (user.isLeader) {
            ratees = await this.userService.findByCondition({
              isDelete: false,
              "layerLine.layerId": organization.parent,
              isLeader: true,
              layer: user.layer
            })
          } else {
            ratees = await this.userService.findByCondition({
              isDelete: false,
              layerId: user.layerId,
              isLeader: true
              // layer: user.layer,
            })
          }
        }
        break;
      case 3:
        {
          ratees = await this.userService.findByCondition({
            isDelete: false,
            layerId: user.layerId,
            isLeader: false
          })
        }
        break;
      //上级领导
      case 4:
        {
          const organization = await this.organizationService.findById(
            user.layerId
          );
          if (!organization) {
            return
          }
          const ratees = await this.userService.findByCondition({
            isDelete: false,
            layerId: organization.parent,
            isLeader: true
          })
        }
        break;
      //所属部门
      case 5:
        {
          ratees = [user.layerId];
        }
        break;
      //上级部门
      case 6:
        {
          const organization = await this.organizationService.findById(
            user.layerId
          );
          if (!organization || !organization.parent) {
            return
          }
          ratees = [organization.parent]
        }
        break;
      //下级部门
      case 7:
        {
          const organization = await this.organizationService.findById(
            user.layerId
          );
          if (!organization || !organization.children || !organization.children.length) {
            return
          }
          ratees = organization.children;
        }
        break;
      default:
        choice = [];
        break;
    }
    if (rateeType === 'user') {
      choice = ratees.map(ratee => {
        if (String(ratee._id) !== String(user._id)) {
          return {
            content: ratee.userinfo.fullname,
            email: ratee.email,
            id: ratee._id,
            rateeType,
          };
        } else return;
      }).filter(v => v);
    } else if (rateeType === 'organization') {
      await Promise.all(
        ratees.map(async child => {
          const organization = await this.organizationService.findById(child);
          if (!organization) {
            return
          }
          choice.push({
            content: organization.name,
            email: "",
            id: organization._id,
            rateeType,
          })
        })
      );
    }

    return choice;
  }

  // 获取current
  async getChoice(userQuestionnaire: IUserQuestionnaire) {
    const questionnaire: IQuestionnaire = userQuestionnaire.questionnaire
    if (questionnaire.category === 0) {
      return [];
    }

    const choice = userQuestionnaire.choice.filter(v => v && !userQuestionnaire.completeRateeId.includes(v.id));
    if (!choice.length) {
      await this.userQuestionnaireModel.findByIdAndUpdate(userQuestionnaire._id, { isCompleted: true })
      const lastCount = await this.userQuestionnaireModel.countDocuments({ companyProject: userQuestionnaire.companyProject, user: userQuestionnaire.user, isCompleted: false })
      if (!lastCount) {
        await this.userProjectService.complete(userQuestionnaire.companyProject, userQuestionnaire.user)
      }
    }
    return choice
  }

  // 获取choice
  async getCurrent(oldCurrent: string, questionnaire: IQuestionnaire): Promise<string> {
    let current = oldCurrent
    if (current === 'userinfo' && (!questionnaire.userinfo || questionnaire.userinfo.length === 0)) {
      current = 'userfilter'
    }
    if (current === 'userfilter' && questionnaire.category === 0) {
      return 'subject'
    }
    if (current === 'userfilter' && (!questionnaire.userfilter || questionnaire.userfilter.length === 0)) {
      current = 'choice'
    }
    return current
  }

  // 根据标签名获取
  async findById(id: string, user: string) {
    const userQuestionnaire = await this.canActive(id, user)
    const questionnaire = userQuestionnaire.questionnaire
    let current = await this.getCurrent(userQuestionnaire.current, userQuestionnaire.questionnaire)
    if ((questionnaire.category === 2 || questionnaire.category === 3) && !userQuestionnaire.choice.length) {
      const fullUserquestionnaire = await this.userQuestionnaireModel
        .findById(id)
        .populate({ path: 'companyProject', model: 'companyProject' })
        .populate({ path: 'user', model: 'user' })
        .lean()
        .exec()
      const project = await this.projectService.findById(fullUserquestionnaire.companyProject.project)
      const questionnaireSetting = _.find(project.questionnaires, {
        questionnaireId: questionnaire._id
      });
      const choice = await this.getRatee(questionnaireSetting.rateeType, fullUserquestionnaire.user)
      await this.userQuestionnaireModel.findByIdAndUpdate(id, { choice })
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

  // 提交用户信息题
  async userinfoAnswer(id: string, userinfo: UserInfoAnswerDTO, user: string) {
    const userQuestionnaire = await this.canActive(id, user)
    await this.userQuestionnaireModel.findByIdAndUpdate(id, { userinfoChoice: userinfo.answer, current: 'userfilter' })
    const current = await this.getCurrent('userfilter', userQuestionnaire.questionnaire)
    return current;
  }


  // 获取筛选题
  async getUserfilter(userQuestionnaire: IUserQuestionnaire, subjectNum: number) {
    const userfilter = await this.questionnaireService.getUserfilterByUser(userQuestionnaire.questionnaire, subjectNum)
    if (subjectNum > 1 && userfilter.filterType !== 'frequency') {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    if (subjectNum === 1 && userfilter.filterType === 'frequency') {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    if (
      userQuestionnaire.userfilterChoice &&
      userQuestionnaire.userfilterChoice[subjectNum - 2] &&
      userQuestionnaire.userfilterChoice[subjectNum - 2].length > 0
    ) {
      return {
        filterType: "frequency",
        guide: userfilter.guide,
        question: userQuestionnaire.choice,
        option: userfilter.option,
      };
    } else {
      return userfilter
    }
  }

  // 处理筛选题的选择
  async getFilterChoice(userfilter: UserfilterDTO, questionnaire: IQuestionnaire, subjectNum: number) {
    const currentFilter = await this.questionnaireService.getUserfilterByUser(questionnaire._id, subjectNum)
    if (currentFilter.filterType === 'user') {
      return userfilter.filterChoose.map(filter => {
        return {
          content: filter.content,
          email: filter.email,
          id: filter.id,
          rateeType: filter.rateeType
        }
      })
    } else if (currentFilter.filterType === 'organization') {
      return userfilter.filterChoose.map(filter => {
        return {
          content: filter.content,
          email: '',
          id: filter.id,
          rateeType: filter.rateeType
        }
      })
    } else if (currentFilter.filterType === 'frequency') {
      const option = currentFilter.option;
      const score = currentFilter.score;
      return userfilter.filterChoose
        .map(v => {
          const index = _.findIndex(option, function (o) { return String(o._id) === v.choose });
          if (score[index].score >= currentFilter.filterScore) {
            return { content: v.content, email: v.email, id: v.id, rateeType: v.rateeType };
          } else {
            return;
          }
        })
        .filter(v => v);
    } else {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
  }


  // 提交用户信息题
  async userfilterAnswer(userQuestionnaire: IUserQuestionnaire, userfilter: UserfilterDTO, subjectNum: number, user: IUser) {
    const { questionnaire } = userQuestionnaire
    const choice = await this.getFilterChoice(userfilter, questionnaire, subjectNum)
    const newUserQuestionaire = await this.userQuestionnaireModel
      .findByIdAndUpdate(userQuestionnaire._id, { choice, $addToSet: { userfilterChoice: userfilter.filterChoose } }, { new: true })
    if (!newUserQuestionaire) {
      return null
    }
    const filterData = await this.questionnaireService.getUserfilterByUser(userQuestionnaire.questionnaire, subjectNum)
    if (filterData.scaleId) {
      await Promise.all(userfilter.filterChoose.map(async filterChoose => {
        let score = 1
        if (filterData.filterType === 'frequency') {
          const selectIndex = _.findIndex(filterData.option, { _id: filterChoose.choose })
          score = filterData.score[selectIndex].score;
        }
        const ratee = await this.userService.findById(filterChoose.id)
        const newUserLink = {
          //评价人
          raterId: user._id,
          //评价人姓名
          raterName: user.userinfo.fullname,
          //被评价人
          rateeId: ratee._id,
          //被评价人姓名
          rateeName: ratee.userinfo.fullname,
          //问卷id
          questionnaire: questionnaire._id,
          //企业id
          companyProject: userQuestionnaire.companyProject,
          // 量表id
          scale: filterData._id,
          //层级线
          raterLayerLine: user.layerLine,
          // 部门id
          raterLayerId: user.layerId,
          //层级线
          rateeLayerLine: ratee.layerLine,
          // 部门id
          rateeLayerId: ratee.layerId,
          //分数
          score,
          // 评价人层级
          raterLayer: user.layer,
          // 被评价人层级
          rateeLayer: ratee.layer,
        }
        await this.userLinkService.create(newUserLink)
      }))
    }
    if (userQuestionnaire.userfilterChoice.length + 1 === questionnaire.userfilter.length) {
      let current = 'choice'
      if (questionnaire.category === 4) {
        current = 'subject'
      }
      await this.userQuestionnaireModel.findByIdAndUpdate(userQuestionnaire._id, { current })
      return { current }
    } else {
      const data = await this.getUserfilter(newUserQuestionaire, subjectNum + 1)
      return { current: 'userfilter', data }
    }
  }

  // 获取主体题
  async getSubject(id: string, user: string) {
    const userQuestionnaire: IUserQuestionnaire = await this.canActive(id, user)
    //设置问卷开始时间
    await this.userQuestionnaireModel.findByIdAndUpdate(id, {
      startTime: Date.now()
    });
    return await this.questionnaireService.getSubjectByUser(userQuestionnaire.questionnaire, userQuestionnaire.choice)
  }

  // 计算得分
  getScore(choices, score, option) {
    let userScore = 0;
    option = JSON.parse(JSON.stringify(option));
    const length = score.length;
    let sum = 0;
    for (let choice of choices) {
      if (choice.optionId && choice.scoreMethod === "forward") {
        const index = _.findIndex(option, { _id: choice.optionId });
        const choiceScore = score[index].score;
        userScore += choiceScore;
        sum += 1;
      } else if (choice.optionId && choice.scoreMethod === "afterward") {
        const index = _.findIndex(option, { _id: choice.optionId });
        const choiceScore = score[length - index - 1].score;
        userScore += choiceScore;
        sum += 1;
      }
    }
    if (sum > 0) {
      return userScore / sum;
    } else {
      return userScore;
    }
  }

  // 非社会网络题
  async NoSocialAnswer(userQuestionnaire: IUserQuestionnaire, userResult: any, user: IUser, project: string) {
    let scoreArray: any = [];
    let answerScore: any = [];
    let evaluateNum = 1;
    let ratee;
    let exist;

    if (userResult.rateeType === 'user') {
      ratee = await this.userService.findById(userResult.rateeId)
      if (!ratee) {
        throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
      }
      exist = await this.userScoreService.findOneByCondition({
        userId: userResult.rateeId,
        questionnaire: userResult.questionnaireId,
        companyProject: userQuestionnaire.companyProject,
      });
    } else if (userResult.rateeType === 'organization') {
      ratee = await this.organizationService.findById(userResult.rateeId)
      if (!ratee) {
        throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
      }
      exist = await this.organizationScoreService.findOneByCondition({
        organizationId: userResult.rateeId,
        questionnaire: userResult.questionnaireId,
        projectId: userResult.projectId
      });
    }
    for (let answer of userResult.answer) {
      if (answer.type === 'scale') {
        const scale: IScale = await this.scaleService.findById(answer.scaleId);
        let score = this.getScore(answer.choice, scale.score, scale.option);
        // score = score/(scale.question.length);
        answerScore.push({ score, scale: answer.scaleId });
        if (exist) {
          evaluateNum = exist.evaluateNum + 1;
          const userScore = _.find(exist.score, { scale: answer.scaleId });
          if (userScore && userScore.score) {
            score = (userScore.score * exist.evaluateNum + score) / evaluateNum;
            // await UserScore.updateUserScore(exist._id, { score: scoreArray, evaluateNum });
          }
        }
        scoreArray.push({ score, scale: answer.scaleId });
      } else {
        answerScore.push({ score: "", scale: "" });
      }
    }
    const projectFile = await this.projectService.findById(project);
    if (scoreArray.length) {
      if (userResult.rateeType === "user") {
        const userScoreObject: any = {
          userId: userResult.rateeId,
          layerId: ratee.layerId,
          layerLine: ratee.layerLine,
          username: ratee.userinfo.fullname,
          email: ratee.email,
          questionnaire: userQuestionnaire.questionnaire._id,
          companyProject: userQuestionnaire.companyProject,
          score: scoreArray,
          evaluateNum,
        };
        //添加周期信息
        if (projectFile.periodicity) {
          userScoreObject.sequence = projectFile.sequence;
        }
        if (exist) {
          await this.userScoreService.findByIdAndUpdate(exist._id, userScoreObject);
        } else {
          await this.userScoreService.create(userScoreObject);
        }
      } else if (userResult.rateeType === 'organization') {

        const userScoreObject: any = {
          organizationId: userResult.rateeId,
          organizationName: ratee.name,
          // email: userResult.rateeEmail,
          questionnaire: userQuestionnaire.questionnaire._id,
          companyProject: userQuestionnaire.companyProject,
          score: scoreArray,
          evaluateNum,
          projectId: userResult.projectId
        };
        //添加周期信息
        if (projectFile.periodicity) {
          userScoreObject.sequence = projectFile.sequence;
        }
        if (exist) {
          await this.organizationScoreService.findByIdAndUpdate(
            exist._id,
            userScoreObject
          );
        } else {
          await this.organizationScoreService.create(userScoreObject);
        }
      }
    }
    const end = moment(Date.now());
    const completeTime = end.diff(userQuestionnaire.startTime, "minutes", true);
    const userAnswer: any = {
      //评价人id
      raterId: user._id,
      //评价人姓名
      raterName: user.userinfo.fullname,
      //评价人邮箱
      raterEmail: user.email,
      //被评价人id
      rateeId: userResult.rateeId,
      //被评价人邮箱
      rateeEmail: userResult.rateeType === 'user' ? ratee.email : '',
      //被评价人姓名
      rateeName: userResult.rateeType === 'user' ? ratee.userinfo.fullname : ratee.name,
      //被评价对象类型
      rateeType: userResult.rateeType,
      //用户问卷id
      userQuestionnaireId: userQuestionnaire._id,
      //问卷id
      questionnaire: userQuestionnaire.questionnaire._id,
      //企业项目id
      companyProject: userQuestionnaire.companyProject,
      //用户答案
      answer: userResult.answer,
      //分数
      score: answerScore,
      //完成时间
      completeTime: completeTime,
    }

    //添加周期信息
    if (projectFile.periodicity) {
      userAnswer.sequence = projectFile.sequence;
    }
    return await this.userAnswerService.create(userAnswer);
  }

  // 非社会网络题
  async socialAnswer(userQuestionnaire: IUserQuestionnaire, userResult, user: IUser, project: string) {
    const end = moment(Date.now());
    const completeTime = end.diff(userQuestionnaire.startTime, "minutes", true);
    const scales = await this.questionnaireService.getScaleOfSubject(userQuestionnaire.questionnaire._id)
    await Promise.all(
      userResult.answer[0].choice.map(async (c, i) => {
        const answer: any = [];
        const rateeId = userResult.answer[0].choice[i].questionId;
        const ratee = await this.userService.findById(rateeId)
        if (!ratee) {
          throw new ApiException('No Found', ApiErrorCode.NO_EXIST, 404)
        }
        await Promise.all(userResult.answer.map(async (ans, subjectNum) => {
          const selectIndex = _.findIndex(scales[subjectNum].option, function (o) { return String(o._id) === ans.choice[i].optionId })
          const score = scales[subjectNum].score[selectIndex].score;
          const newUserLink = {
            //评价人
            raterId: user._id,
            //评价人姓名
            raterName: user.userinfo.fullname,
            //被评价人
            rateeId: ratee._id,
            //被评价人姓名
            rateeName: ratee.userinfo.fullname,
            //问卷id
            questionnaire: userQuestionnaire.questionnaire._id,
            //企业id
            companyProject: userQuestionnaire.companyProject,
            // 量表id
            scale: ans.scaleId,
            //层级线
            raterLayerLine: user.layerLine,
            // 部门id
            raterLayerId: user.layerId,
            //层级线
            rateeLayerLine: ratee.layerLine,
            // 部门id
            rateeLayerId: ratee.layerId,
            //分数
            score,
            // 评价人层级
            raterLayer: user.layer,
            // 被评价人层级
            rateeLayer: ratee.layer,
          }
          await this.userLinkService.create(newUserLink)
          answer.push({
            type: "social",
            scaleId: ans.scaleId,
            choice: ans.choice[i]
          });
        }));
        const result: any = {
          raterId: user._id,
          raterName: user.userinfo.fullname,
          raterEmail: user.email,
          rateeId,
          rateeName: ratee.userinfo.fullname,
          rateeEmail: ratee.email,
          rateeType: userResult.rateeType,
          userQuestionnaireId: userQuestionnaire._id,
          questionnaire: userQuestionnaire.questionnaire._id,
          companyProject: userQuestionnaire.companyProject,
          answer,
          score: [],
          completeTime
        };
        const projectFile = await this.projectService.findById(project);
        if (projectFile.periodicity) {
          result.sequence = projectFile.sequence;
        }
        await this.userAnswerService.create(result);
      })
    );
  }

  // 提交主体题
  async subjectAnswer(id: string, user: IUser, subjectAnswer: any) {
    const userQuestionnaire = await this.canActive(id, user._id)
    const fullUserquestionnaire = await this.userQuestionnaireModel
      .findById(id)
      .populate({ path: 'companyProject', model: 'companyProject' })
      .lean()
      .exec()
    const questionnaire: IQuestionnaire = userQuestionnaire.questionnaire
    if (subjectAnswer.answer.length !== questionnaire.subject.length) {
      throw new ApiException('No Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    Object.assign(subjectAnswer, {
      companyProject: userQuestionnaire.companyProject,
      questionnaire: questionnaire._id,
    });
    if (questionnaire.category === 3 || questionnaire.category === 4) {
      await this.socialAnswer(
        userQuestionnaire,
        subjectAnswer,
        user,
        fullUserquestionnaire.companyProject.project
      );
    } else {
      await this.NoSocialAnswer(userQuestionnaire, subjectAnswer, user, fullUserquestionnaire.companyProject.project)
    }

    //互评类型问卷特殊处理
    if (questionnaire.category === 2 || questionnaire.category === 1) {
      const choice = await this.getChoice(userQuestionnaire)
      const newChoice = choice.filter(v => v.id !== subjectAnswer.rateeId)
      await this.userQuestionnaireModel.findByIdAndUpdate(id, { $addToSet: { completeRateeId: subjectAnswer.rateeId } })
      if (newChoice.length) {
        return 'choice'
      }
    }
    await this.userQuestionnaireModel.findByIdAndUpdate(id, { isCompleted: true })
    const lastCount = await this.userQuestionnaireModel.countDocuments({ companyProject: userQuestionnaire.companyProject, user: user._id, isCompleted: false })
    if (!lastCount) {
      await this.userProjectService.complete(userQuestionnaire.companyProject, user._id)
    }
    return 'completed'
  }
}