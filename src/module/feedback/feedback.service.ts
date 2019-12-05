import * as _ from 'lodash'
import * as uuid from 'uuid/v4'
import { Inject, Injectable } from '@nestjs/common'
import { UserProjectService } from '../userProject/userProject.service';
import { CompanyProjectService } from '../companyProject/companyProject.service';
import { UserQuestionnaireService } from '../userQuestionnaire/userQuestionnaire.service';
import { ScaleService } from '../scale/scale.service';
import { RedisService } from 'nestjs-redis';
import { IUser } from '../user/user.interfaces';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { ApiException } from 'src/common/expection/api.exception';
import { UserScoreService } from '../userScore/userScore.service';
import { IScale } from '../scale/sacle.interfaces';
import { OrganizationService } from '../organization/organization.service';
import { UserLinkService } from '../userLink/userLink.service';
import { IOrganization } from '../organization/organization.interfaces';
import { UserService } from '../user/user.service';

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(CompanyProjectService) private readonly companyProjectService: CompanyProjectService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
    @Inject(UserScoreService) private readonly userScoreService: UserScoreService,
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
    @Inject(UserLinkService) private readonly userLinkService: UserLinkService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(UserService) private readonly userService: UserService,
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


  getScaleMaxAndMinScore(scale: IScale): { max: number, min: number } {
    if (scale.scaleType === 'filterScale') {
      if (scale.filterType === 'frequency') {
        const maxScore = _.maxBy(scale.score, 'score')
        return { max: maxScore.score, min: 0 }
      } else {
        return { max: 1, min: 0 }
      }
    } else if (scale.scaleType === 'socialScale') {
      const maxScore = _.maxBy(scale.score, 'score')
      return { max: maxScore.score, min: 0 }
    } else {
      throw new ApiException('No Permission5', ApiErrorCode.NO_PERMISSION, 403)
    }
  }

  // 获取问卷的指标详情
  async leaderPermission(project: string, questionnaire: string, user: string) {
    const companyProject = await this.companyProjectService.findByIdWithProject(project)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire: String(questionnaire) })
    if (setting) {
      return setting.leaderFeedback
    } else {
      throw new ApiException('No Permission6', ApiErrorCode.NO_PERMISSION, 403)
    }
  }

  // 我的评价
  async myEvaluation(score: number, scale: IScale) {
    const feedback = scale.feedback
    let evaluation: any
    feedback.map(evaluate => {
      if (score >= evaluate.lower && score <= evaluate.upper) {
        evaluation = { recommend: evaluate.recommend, evaluation: evaluate.evaluation };
      }
    })
    return evaluation
  }

  // 我的分数
  async me(questionnaire: string, companyProject: string, user: string, scale: IScale) {
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
    return {
      score: scaleScoreOfMe.score,
      rank,
      evaluateNum: userScoreOfMe.evaluateNum,
      evaluation,
    }

  }

  // 我的分数
  async depScore(questionnaire: string, companyProject: string, layerId: string, scale: IScale) {
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
    const me = await this.me(questionnaire, companyProject, user._id, scale)
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
    await Promise.all(departments.map(async (department, index) => {
      const depScore = await this.depScore(
        questionnaire,
        companyProject,
        department._id,
        scale,
      )
      if (depScore.scoreSort.length) {
        departmentScore[index] = {
          name: department.name,
          scores: depScore.scoreSort
        }
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
    return { departmentScore: departmentScore.filter(v => v), userScore }
  }

  getEvaluation(oriScore, evaluates, type: number) {
    const score = (1 - oriScore) * 100
    console.log(score, 'score')
    let evaluation: any
    console.log(evaluates, 'ss')
    const evaluate = _.find(evaluates, { type })
    console.log(evaluate, 'ssss')
    if (!evaluate) {
      return null
    }
    evaluate.evaluate.map(eva => {
      if (score >= eva.lower && score <= eva.upper) {
        evaluation = { recommend: eva.recommend, evaluation: eva.evaluation };
      }
    })
    return evaluation

  }

  getMyIndicator(nodes, userId: string, scale: IScale) {
    const me = _.find(nodes, { id: String(userId) })

    const linkCountSort = _.orderBy(nodes, 'linkCount', 'desc')
    const netsize_full_rank = me ? _.findIndex(linkCountSort, { linkCount: me.linkCount }) : linkCountSort.length

    const scoreSort = _.orderBy(nodes, 'value', 'desc')
    const indegree_full_rank = me ? _.findIndex(scoreSort, { value: me.value }) : scoreSort.length

    const crossindegreeSort = _.orderBy(nodes, 'crossindegree_full', 'desc')
    const crossindegree_full_rank = me ? _.findIndex(crossindegreeSort, { crossindegree_full: me.crossindegree_full }) : crossindegreeSort.length

    const crossdeptratioSort = _.orderBy(nodes, 'crossdeptratio', 'desc')
    const crossdeptratio_rank = me ? _.findIndex(crossdeptratioSort, { crossdeptratio: me.crossdeptratio }) : crossdeptratioSort.length

    const reciprocitySort = _.orderBy(nodes, 'reciprocity_full', 'desc')
    const reciprocity_full_rank = me ? _.findIndex(reciprocitySort, { reciprocity_full: me.reciprocity_full }) : reciprocitySort.length

    const crosslevelratio = _.orderBy(nodes, 'crosslevelratio', 'desc')
    const crosslevelratio_rank = me ? _.findIndex(crosslevelratio, { crosslevelratio: me.crosslevelratio }) : reciprocitySort.length

    return {
      netsize_full: me ? me.linkCount : 0,
      netsize_full_rank,
      netsize_fulls: linkCountSort.map(v => v.linkCount),
      netsize_full_evaluation: this.getEvaluation(netsize_full_rank / linkCountSort.length, scale.socialFeedback, 1),

      indegree_full: me ? me.value : 0,
      indegree_full_rank,
      indegree_fulls: scoreSort.map(v => v.value),
      indegree_full_evaluation: this.getEvaluation(indegree_full_rank / scoreSort.length, scale.socialFeedback, 2),

      crossindegree_full: me ? me.crossindegree_full : 0,
      crossindegree_full_rank,
      crossindegree_fulls: crossindegreeSort.map(v => v.crossindegree_full),
      crossindegree_full_evaluation: this.getEvaluation(crossindegree_full_rank / crossindegreeSort.length, scale.socialFeedback, 3),

      crossdeptratio: me ? me.crossdeptratio : 0,
      crossdeptratio_rank,
      crossdeptratios: crossdeptratioSort.map(v => v.crossdeptratio),
      crossdeptratio_evaluation: this.getEvaluation(crossdeptratio_rank / crossdeptratioSort.length, scale.socialFeedback, 4),

      reciprocity_full: me ? me.reciprocity_full : 0,
      reciprocity_full_rank,
      reciprocity_fulls: reciprocitySort.map(v => v.reciprocity_full),
      reciprocity_full_evaluation: this.getEvaluation(reciprocity_full_rank / reciprocitySort.length, scale.socialFeedback, 5),

      crosslevelratio: me ? me.crosslevelratio : 0,
      crosslevelratio_rank,
      crosslevelratios: crosslevelratio.map(v => v.crosslevelratio),
      crosslevelratio_evaluation: this.getEvaluation(crosslevelratio_rank / crosslevelratio.length, scale.socialFeedback, 6),

    }
  }



  async getDepartmentNet(condition: any, layer: number, nameVisible: boolean, userId: string, scale: IScale) {
    const uid = uuid()
    const links = await this.userLinkService.findByCondition(condition)
    if (!links.length) {
      return null
    }
    const client = this.redis.getClient()
    await Promise.all(links.map(async (link) => {
      await client.hset(`user${uid}`, link.raterId, JSON.stringify({ id: link.raterId, username: link.raterName, category: link.raterLayerLine[layer].layerId }))
      await client.hset(`user${uid}`, link.rateeId, JSON.stringify({ id: link.rateeId, username: link.rateeName, category: link.rateeLayerLine[layer].layerId }))
      await client.hincrby(`userScore${uid}`, link.rateeId, link.score)
      await client.hincrby(`linkCount${uid}`, link.rateeId, 1)
    }))
    const users = await client.hkeys(`user${uid}`)
    const nodes = await Promise.all(users.map(async node => {
      const user = JSON.parse(await client.hget(`user${uid}`, node) || '')
      let score = Number(await client.hget(`userScore${uid}`, node) || '0')
      let linkCount = Number(await client.hget(`linkCount${uid}`, node) || '0')
      const myChoose = _.filter(links, { raterId: node })
      const myChooseCount = myChoose.length
      const bothChoose = _.filter(links, { raterId: node, both: true })
      const bothChooseCount = bothChoose.length
      return {
        id: user.id,
        name: nameVisible ? user.username : '',
        linkCount,
        value: score,
        reciprocity_dep: myChooseCount > 0 ? bothChooseCount / myChooseCount * 100 : 0,
      }
    }))
    await client.del(`user${uid}`)
    await client.del(`userScore${uid}`)
    await client.del(`linkCount${uid}`)

    const me = _.find(nodes, { id: String(userId) })

    const linkCountSort = _.orderBy(nodes, 'linkCount', 'desc')
    const netsize_dept_rank = me ? _.findIndex(linkCountSort, { linkCount: me.linkCount }) : linkCountSort.length

    const scoreSort = _.orderBy(nodes, 'value', 'desc')
    const indegree_dept_rank = me ? _.findIndex(scoreSort, { value: me.value }) : scoreSort.length
    const reciprocitySort = _.orderBy(nodes, 'reciprocity_dep', 'desc')
    const reciprocity_dept_rank = me ? _.findIndex(reciprocitySort, { reciprocity_dep: me.reciprocity_dep }) : reciprocitySort.length
    const indicator = {
      netsize_dept: me ? me.linkCount : 0,
      netsize_dept_rank,
      netsize_depts: linkCountSort.map(v => v.linkCount),
      netsize_dept_evaluation: this.getEvaluation(netsize_dept_rank / linkCountSort.length, scale.socialFeedback, 7),

      indegree_dept: me ? me.value : 0,
      indegree_dept_rank,
      indegree_depts: scoreSort.map(v => v.value),
      indegree_dept_evaluation: this.getEvaluation(indegree_dept_rank / scoreSort.length, scale.socialFeedback, 8),

      reciprocity_dept: me ? me.reciprocity_dep : 0,
      reciprocity_dept_rank,
      reciprocity_depts: reciprocitySort.map(v => v.reciprocity_dep),
      reciprocity_dept_evaluation: this.getEvaluation(reciprocity_dept_rank / reciprocitySort.length, scale.socialFeedback, 9),
    }
    return { indicator }

  }

  async getCompanyNet(condition: any, layer: number, nameVisible: boolean, userId: string, scale: IScale) {
    // const uid = uuid()
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!')
    const links = await this.userLinkService.findByCondition(condition)
    let myLinkNodeUsers: any[] = []
    const myLinks: any[] = []
    const myLinkNodes: any[] = []
    let myLinkCategorys: any[] = []
    const nodes: any[] = []
    const categorys: any[] = []
    const start = Date.now()
    console.log('start:', start)
    // const client = this.redis.getClient()
    const newLink = await Promise.all(links.map(async (link) => {
      if (_.findIndex(categorys, { id: String(link.raterLayerLine[layer].layerId) }) < 0) {
        categorys.push({
          id: String(link.raterLayerLine[layer].layerId),
          name: link.raterLayerLine[layer].layerName
        })
      }
      const raterExist = nodes.find(o => o.id === String(link.raterId))
      if (!raterExist) {
        nodes.push({
          id: String(link.raterId),
          name: link.raterName,
          category: String(link.raterLayerLine[layer].layerId),
          score: 0,
          linkCount: 0,
          userScore_otherDep: 0,
          userScore_otherLayer: 0,
          myChoose: 1,
          bothChoose: link.both ? 1 : 0
        })
      } else {
        raterExist.myChoose += 1
        raterExist.bothChoose += link.both ? 1 : 0
      }

      const rateeExist = nodes.find(o => o.id === String(link.rateeId))
      if (!rateeExist) {
        nodes.push({
          id: String(link.raterId),
          name: link.raterName,
          category: String(link.raterLayerLine[layer].layerId),
          score: link.score,
          linkCount: 1,
          myChoose: 0,
          bothChoose: 0,
          userScore_otherDep: _.findIndex(link.rateeLayerLine, { layerId: link.raterLayerId }) < 0 ? link.score : 0,
          userScore_otherLayer: link.raterLayer !== link.rateeLayer ? link.score : 0
        })
      } else {
        rateeExist.score += link.score
        rateeExist.linkCount += 1
        rateeExist.userScore_otherDep += _.findIndex(link.rateeLayerLine, { layerId: link.raterLayerId }) < 0 ? link.score : 0
        rateeExist.userScore_otherLayer += link.raterLayer !== link.rateeLayer ? link.score : 0
      }

      // await client.hset(`user${uid}`, link.raterId, JSON.stringify({ id: link.raterId, username: link.raterName, category: link.raterLayerLine[layer].layerId }))
      // await client.hset(`category${uid}`, link.rateeLayerLine[layer].layerId, link.rateeLayerLine[layer].layerName)
      // await client.hset(`user${uid}`, link.rateeId, JSON.stringify({ id: link.rateeId, username: link.rateeName, category: link.rateeLayerLine[layer].layerId }))
      // await client.hincrby(`userScore${uid}`, link.rateeId, link.score)
      // await client.hincrby(`linkCount${uid}`, link.rateeId, 1)
      // if (_.findIndex(link.rateeLayerLine, { layerId: link.raterLayerId }) === -1) {
      //   await client.hincrby(`userScore_otherDep${uid}`, link.rateeId, 1)
      // }
      // if (link.raterLayer !== link.rateeLayer) {
      //   await client.hincrby(`userScore_otherLayer${uid}`, link.rateeId, 1)
      // }
      if (String(userId) === String(link.raterId) || String(userId) === String(link.rateeId)) {
        myLinks.push({ id: String(link._id), source: String(link.raterId), target: String(link.rateeId), weight: link.score })
        myLinkNodeUsers.push(String(link.raterId))
        myLinkCategorys.push({ id: String(link.raterLayerLine[layer].layerId), name: link.raterLayerLine[layer].layerName })
        myLinkNodeUsers.push(String(link.rateeId))
        myLinkCategorys.push({ id: String(link.rateeLayerLine[layer].layerId), name: link.rateeLayerLine[layer].layerName })
      }
      return { id: String(link._id), source: String(link.raterId), target: String(link.rateeId), weight: link.score }
    }))
    // const categoryKeys = await client.hkeys(`category${uid}`)
    // const categorys = await Promise.all(categoryKeys.map(async key => {
    //   const name = await client.hget(`category${uid}`, key)
    //   return {
    //     id: key,
    //     name,
    //   }
    // }))
    myLinkCategorys = _.uniqBy(myLinkCategorys, 'id')
    myLinkNodeUsers = _.uniq(myLinkNodeUsers)
    // const users = await client.hkeys(`user${uid}`)
    const newNodes = await Promise.all(nodes.map(async node => {
      // const user = JSON.parse(await client.hget(`user${uid}`, node) || '')

      // let score = Number(await client.hget(`userScore${uid}`, node) || '0')
      // let otherDepScore = Number(await client.hget(`userScore_otherDep${uid}`, node) || '0')
      // let otherLayerScore = Number(await client.hget(`userScore_otherLayer${uid}`, node) || '0')
      // let linkCount = Number(await client.hget(`linkCount${uid}`, node) || '0')
      // const myChoose = _.filter(links, { raterId: node })
      // const myChooseCount = myChoose.length
      // const bothChoose = _.filter(links, { raterId: node, both: true })
      // const bothChooseCount = bothChoose.length
      if (_.indexOf(myLinkNodeUsers, { id: node.id }) > -1) {
        myLinkNodes.push({
          id: node.id,
          name: nameVisible || node.id === String(userId) ? node.username : '',
          linkCount: node.linkCount,
          category: _.findIndex(myLinkCategorys, { id: node.category }),
          value: node.score,
        })
      }
      return {

        id: node.id,
        name: nameVisible || node.id === String(userId) ? node.username : '',
        linkCount: node.linkCount,
        category: _.findIndex(categorys, { id: node.category }),
        value: node.score,
        crossindegree_full: node.userScore_otherDep,
        crossdeptratio: node.score > 0 ? node.userScore_otherDep / node.score * 100 : 0,
        reciprocity_full: node.myChoose > 0 ? node.bothChoose / node.myChoose * 100 : 0,
        crosslevelratio: node.score > 0 ? node.userScore_otherLayer / node.score * 100 : 0,
      }
    }))
    const max = _.maxBy(nodes, 'value')
    // await client.del(`user${uid}`)
    // await client.del(`category${uid}`)
    // await client.del(`userScore${uid}`)
    // await client.del(`linkCount${uid}`)
    // await client.del(`userScore_otherDep${uid}`)
    // await client.del(`userScore_otherLayer${uid}`)
    const indicator = this.getMyIndicator(nodes, userId, scale)
    console.log(Date.now() - start, 's-----——————--------——————————')
    return { categorys, nodes: newNodes, links: newLink, max, indicator, myLinks }

  }

  async userNetByLeader(condition: any, organization: IOrganization) {
    const uid = uuid()
    const links = await this.userLinkService.findByCondition(condition)
    const client = this.redis.getClient()
    const newLink = await Promise.all(links.map(async (link) => {
      let raterCategory = { id: String(organization._id), name: organization.name };
      let rateeCategory = { id: String(organization._id), name: organization.name };
      if (link.raterLayerLine.length > organization.layer) {
        raterCategory = { name: link.raterLayerLine[organization.layer].layerName, id: link.raterLayerLine[organization.layer].layerId, }
      }
      if (link.rateeLayerLine.length > organization.layer) {
        rateeCategory = { name: link.rateeLayerLine[organization.layer].layerName, id: link.rateeLayerLine[organization.layer].layerId, }
      }
      await client.hset(`category${uid}`, raterCategory.id, raterCategory.name)
      await client.hset(`user${uid}`, link.raterId, JSON.stringify({ id: link.raterId, username: link.raterName, category: raterCategory.id }))
      await client.hset(`category${uid}`, rateeCategory.id, rateeCategory.name)
      await client.hset(`user${uid}`, link.rateeId, JSON.stringify({ id: link.rateeId, username: link.rateeName, category: rateeCategory.id }))
      await client.hincrby(`userScore${uid}`, link.rateeId, link.score)
      return { id: String(link._id), source: String(link.raterId), target: String(link.rateeId), weight: link.score }
    }))

    const categoryKeys = await client.hkeys(`category${uid}`)
    const categorys = await Promise.all(categoryKeys.map(async key => {
      const name = await client.hget(`category${uid}`, key)
      return {
        id: key,
        name,
      }
    }))
    const users = await client.hkeys(`user${uid}`)
    const nodes = await Promise.all(users.map(async node => {
      const user = JSON.parse(await client.hget(`user${uid}`, node) || '')

      let score = Number(await client.hget(`userScore${uid}`, node) || '0')
      return {
        id: user.id,
        name: user.username,
        category: _.findIndex(categorys, { id: user.category }),
        value: score,
      }
    }))
    const max = _.maxBy(nodes, 'value')
    await client.del(`user${uid}`)
    await client.del(`category${uid}`)
    await client.del(`userScore${uid}`)
    return { userCategorys: categorys, userNodes: nodes, userLinks: newLink, userMax: max }
  }

  async departmentNetByLeader(condition: any, organization: IOrganization, scale: IScale) {
    const uid = uuid()
    const { layer } = organization
    const { max, min } = this.getScaleMaxAndMinScore(scale)
    const links = await this.userLinkService.findByCondition(condition)
    const client = this.redis.getClient()
    await Promise.all(links.map(async (link) => {
      if (link.raterLayer >= layer && link.rateeLayer >= layer) {
        const raterLayerId = link.raterLayerLine[layer - 1].layerId
        const raterLayerName = link.raterLayerLine[layer - 1].layerName
        const rateeLayerId = link.rateeLayerLine[layer - 1].layerId
        const rateeLayerName = link.rateeLayerLine[layer - 1].layerName
        if (raterLayerId === rateeLayerId) {
          await client.hset(`department${uid}`, raterLayerId, raterLayerName)
          await client.hincrby(`departmentScore${uid}`, raterLayerId, link.score)
          await client.hincrby(`user${uid}-${raterLayerId}`, link.rateeId, link.score)
          if (link.both) {
            await client.hincrby(`linkCountNoBoth${uid}`, raterLayerId, 1)
          } else {
            await client.hincrby(`linkCountBoth${uid}`, raterLayerId, 1)
          }

        } else {
          await client.hset(`node${uid}`, rateeLayerId, raterLayerName)
          await client.hincrby(`departmentOtherScore${uid}`, rateeLayerId, link.score)
          await client.hset(`node${uid}`, raterLayerId, rateeLayerName)
          await client.hincrby(`link${uid}-${raterLayerId}`, rateeLayerId, link.score)
        }

      } else if (link.rateeLayer >= layer) {
        const rateeLayerId = link.rateeLayerLine[layer - 1].layerId
        const rateeLayerName = link.rateeLayerLine[layer - 1].layerName
        await client.hset(`department${uid}`, rateeLayerId, rateeLayerName)
        await client.hincrby(`departmentOtherLayerScore${uid}`, rateeLayerId, link.score)
      }
    }))
    const departmentKeys = await client.hkeys(`department${uid}`)
    const departments: any = await Promise.all(departmentKeys.map(async key => {
      const name = await client.hget(`department${uid}`, key)
      const value = Number(await client.hget(`departmentOtherScore${uid}`, key) || 0)
      const linkCountNoBoth = Number(await client.hget(`linkCountNoBoth${uid}`, key) || '0')
      const linkCountBoth = Number(await client.hget(`linkCountBoth${uid}`, key) || '0')
      const otherLayerScore = Number(await client.hget(`departmentOtherLayerScore${uid}`, key) || '0')
      const sameDepScore = Number(await client.hget(`departmentScore${uid}`, key) || '0')
      let deptcrossdept_deptlevel = 0
      let density_deptlevel = 0
      const userCount = await this.userService.countByCondition({ 'layerLine.layerId': key, isDelete: false })
      if (value || otherLayerScore || sameDepScore) {
        deptcrossdept_deptlevel = (otherLayerScore + value) / (sameDepScore + value + otherLayerScore)
      }
      if (sameDepScore) {
        const Max = max * userCount * (userCount - 1)
        density_deptlevel = sameDepScore / Max
      }
      const userKeys = await client.hkeys(`user${uid}-${key}`)
      const userScores: { id: string, score: number }[] = await Promise.all(userKeys.map(async user => {
        const scoreOfUser = Number(await client.hget(`user${uid}-${key}`, user))

        return {
          id: user,
          score: scoreOfUser
        }
      }))
      const maxUserScore = _.maxBy(userScores, 'score')
      let centralization = 0
      userScores.map(userScore => {
        centralization += (maxUserScore.score - userScore.score)
      })
      if (userScores.length < userCount) {
        centralization += maxUserScore.score * (userCount - userScores.length)
      }
      const centralization_dep = (userCount - 1) * (userCount - 1) * (max - min)

      const node = {
        id: key,
        name,
        value,
        reciprocity_deptlevel: (linkCountNoBoth > 0 || linkCountBoth) > 0 ? linkCountBoth / 2 / (linkCountNoBoth + linkCountBoth / 2) : 0,
        deptcrossdept_deptlevel,
        density_deptlevel,
        centralization_deptlevel: centralization / centralization_dep * 100
      }
      await client.del(`user${uid}-${key}`)
      return node
    }))

    const nodeKeys = await client.hkeys(`node${uid}`)
    const nodes: any[] = await Promise.all(nodeKeys.map(async nodeKey => {
      const nodeName = await client.hget(`node${uid}`, nodeKey)
      const nodeValue = Number(await client.hget(`departmentOtherScore${uid}`, nodeKey) || 0)
      return {
        id: nodeKey,
        value: nodeValue,
        name: nodeName,
      }
    }))

    const departmentLinks: any[] = []
    await Promise.all(nodes.map(async source => {
      const linkKeys = await client.hkeys(`link${uid}-${source.id}`)
      await Promise.all(linkKeys.map(async target => {
        const weight = Number(await client.hget(`link${uid}-${source.id}`, target) || 0)
        if (weight) {
          departmentLinks.push({
            source: String(source.id),
            target,
            weight,
          })
        }
      }))
      await client.del(`link${uid}-${source.id}`)
    }))

    await client.del(`department${uid}`)
    await client.del(`departmentScore${uid}`)
    await client.del(`linkCountNoBoth${uid}`)
    await client.del(`linkCountBoth${uid}`)
    await client.del(`node${uid}`)
    await client.del(`departmentOtherScore${uid}`)
    await client.del(`departmentOtherLayerScore${uid}`)
    const myDepartment = _.find(departments, { id: String(organization._id) })

    const density_deptlevel_sort = _.orderBy(departments, 'density_deptlevel', 'desc')
    const density_deptlevel_rank = myDepartment ? _.findIndex(density_deptlevel_sort, { density_deptlevel: myDepartment.density_deptlevel }) : departments.length

    const centralization_deptlevel_sort = _.orderBy(departments, 'centralization_deptlevel', 'desc')
    const centralization_deptlevel_rank = myDepartment ? _.findIndex(centralization_deptlevel_sort, { centralization_deptlevel: myDepartment.centralization_deptlevel }) : departments.length

    const reciprocity_deptlevel_sort = _.orderBy(departments, 'reciprocity_deptlevel', 'desc')
    const reciprocity_deptlevel_rank = myDepartment ? _.findIndex(reciprocity_deptlevel_sort, { reciprocity_deptlevel: myDepartment.reciprocity_deptlevel }) : departments.length

    const deptcrossdept_deptlevel_sort = _.orderBy(departments, 'deptcrossdept_deptlevel', 'desc')
    const deptcrossdept_deptlevel_rank = myDepartment ? _.findIndex(deptcrossdept_deptlevel_sort, { deptcrossdept_deptlevel: myDepartment.deptcrossdept_deptlevel }) : departments.length

    const deptcentrality_deptlevel_sort = _.orderBy(departments, 'value', 'desc')
    const deptcentrality_deptlevel_rank = myDepartment ? _.findIndex(deptcentrality_deptlevel_sort, { value: myDepartment.value }) : departments.length

    const indicator = {
      density_deptlevel: myDepartment ? myDepartment.density_deptlevel : 0,
      density_deptlevel_rank,
      density_deptlevels: departments.map(v => v.density_deptlevel),
      density_deptlevel_evaluation: this.getEvaluation(density_deptlevel_rank / departments.length, scale.socialFeedback, 10),

      centralization_deptlevel: myDepartment ? myDepartment.centralization_deptlevel : 0,
      centralization_deptlevel_rank,
      centralization_deptlevels: departments.map(v => v.centralization_deptlevel),
      centralization_deptlevel_evaluation: this.getEvaluation(centralization_deptlevel_rank / departments.length, scale.socialFeedback, 11),

      reciprocity_deptlevel: myDepartment ? myDepartment.reciprocity_deptlevel : 0,
      reciprocity_deptlevel_rank,
      reciprocity_deptlevels: departments.map(v => v.reciprocity_deptlevel),
      reciprocity_deptlevel_evaluation: this.getEvaluation(reciprocity_deptlevel_rank / departments.length, scale.socialFeedback, 12),

      deptcrossdept_deptlevel: myDepartment ? myDepartment.deptcrossdept_deptlevel : 0,
      deptcrossdept_deptlevel_rank,
      deptcrossdept_deptlevels: departments.map(v => v.deptcrossdept_deptlevel),
      deptcrossdept_deptlevel_evaluation: this.getEvaluation(deptcrossdept_deptlevel_rank / departments.length, scale.socialFeedback, 13),

      deptcentrality_deptlevel: myDepartment ? myDepartment.value : 0,
      deptcentrality_deptlevel_rank,
      deptcentrality_deptlevels: departments.map(v => v.value),
      deptcentrality_deptlevel_evaluation: this.getEvaluation(deptcentrality_deptlevel_rank / departments.length, scale.socialFeedback, 14),
    }
    const departmentMax = _.maxBy(nodes, 'value')
    return { indicator, departments: nodes, departmentLinks, departmentMax }
  }

  // 获取指标的反馈详情
  async feedback(project: string, questionnaire: string, scaleId: string, leader: number, user: IUser, departmentId: string) {
    if (leader && (!user.isLeader || !departmentId)) {
      throw new ApiException('No Permission1', ApiErrorCode.NO_PERMISSION, 403)
    }
    const companyProject = await this.companyProjectService.findById(project)
    const setting = _.find(companyProject.questionnaireSetting, { questionnaire })
    const index = _.findIndex(setting.scales, function (o) { return String(o) === scaleId });
    if (index < 0) {
      throw new ApiException('No Permission2', ApiErrorCode.NO_PERMISSION, 403)
    }
    const scale = await this.scaleService.findById(scaleId)
    if (scale.scaleType === 'filterScale' || scale.scaleType === 'socialScale') {
      if (!leader) {
        const companyCondition = { scale: scaleId, companyProject: project, questionnaire }
        const companyNet = await this.getCompanyNet(companyCondition, 0, setting.staffFeedback.sameDepNameVisiable, user._id, scale)
        const departmentCondition = {
          scale: scaleId,
          companyProject: project,
          questionnaire,
          'raterLayerLine.layerId': user.layerId,
          'rateeLayerLine.layerId': user.layerId,
        }
        const departmentNet = await this.getDepartmentNet(departmentCondition, 0, setting.staffFeedback.sameDepNameVisiable, user._id, scale)
        // const myNet = this.getNet({ raterId: user._id, scale: scaleId, companyProject: project, questionnaire }, 0)
        // const myDepartmentNet = this.getNet({ layerId: user.layerId, scale: scaleId, companyProject: project, questionnaire }, 0)
        return {
          companyNet,
          scale,
          departmentNet,
          // myNet,
          // myDepartmentNet
        }
      } else {
        const organization = await this.organizationService.findById(departmentId)
        if (!organization) {
          throw new ApiException('No Permission3', ApiErrorCode.NO_PERMISSION, 403)
        }
        const myDepartment = await this.organizationService.findById(user.layerId)
        if (!myDepartment) {
          throw new ApiException('No Permission4', ApiErrorCode.NO_PERMISSION, 403)
        }

        let condition = {
          scale: scaleId,
          companyProject: project,
          questionnaire,
        }
        if (organization.layer > 0) {
          const extendCondition = {
            'raterLayerLine.layerId': departmentId,
            'rateeLayerLine.layerId': departmentId,
          }
          condition = {
            ...condition,
            ...extendCondition
          }
        }
        const companyCondition = { scale: scaleId, companyProject: project, questionnaire }
        const departmentNetByLeader = await this.departmentNetByLeader(companyCondition, myDepartment, scale)
        const userNet = await this.userNetByLeader(condition, organization)
        return { userNet, departmentNetByLeader, scale }
      }

    }
    if (!leader) {
      return await this.staffFeedback(project, questionnaire, user, scale, setting)
    } else {
      return await this.leaderFeedback(project, questionnaire, user, scale, departmentId)
    }
  }
}