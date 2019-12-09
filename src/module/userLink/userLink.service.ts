import { Model } from 'mongoose'
import * as  XLSX from "xlsx";
import { Inject, Injectable } from '@nestjs/common'
import { IUserLink } from './userLink.interfaces';
import { UserService } from '../user/user.service';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class UserLinkService {
  constructor(
    @Inject('UserLinkModelToken') private readonly userLinkModel: Model<IUserLink>,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) { }

  // 创建数据
  async create(userLink: any): Promise<IUserLink> {
    const exist = await this.userLinkModel.findOne({
      raterId: userLink.rateeId,
      rateeId: userLink.raterId,
      companyProject: userLink.companyProject,
      questionnaire: userLink.questionnaire,
      scale: userLink.scale
    })
    if (exist) {
      userLink.both = true
      await this.userLinkModel.findByIdAndUpdate(exist._id, { both: true })
    }
    return await this.userLinkModel.create(userLink)
  }

  // 删除数据
  async deleteById(id: string) {
    return await this.userLinkModel.findByIdAndDelete(id)
  }

  // 根据条件查询
  async findByCondition(condition: any) {
    return await this.userLinkModel.find(condition).lean().exec()
  }

  // 根据条件查询
  async findByConditionWithoutUser(condition: any) {
    return await this.userLinkModel.find(condition).select({ raterName: 0, rateeName: 0 }).lean().exec()
  }

  // 根据条件查询
  async findOneByCondition(condition: any) {
    return await this.userLinkModel.findOne(condition).lean().exec()
  }

  // 根据id更新
  async findByIdAndUpdate(id: string, update: any) {
    return await this.userLinkModel.findByIdAndUpdate(id, update).lean().exec()
  }

  async upload(path: string, filename: string) {
    await this.genUser()
    const workbook = XLSX.readFile(`${path}/${filename}`);
    const sheetNames = workbook.SheetNames;
    const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
    const client = this.redis.getClient()
    console.log(data, 'aa')
    await Promise.all(data.map(async i => {
      const choice = i.choice
      const score = choice === 'N' ? 0 : 1
      if (score === 0) { return }
      const user = await this.getUser(i.rater)
      if (!user) {
        return
      }
      const ratee = await this.getUser(i.ratee)
      if (!ratee) {
        return
      }
      const exist = await client.hget(i.ratee, i.rater)
      let both = false
      if (exist) {
        both = true
      }
      await client.hincrby(i.rater, i.ratee, 1)
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
        questionnaire: '5ded6cddc5e59f3214f91a08',
        //企业id
        companyProject: '5dee519c32b4424f46c3d59c',
        // 量表id
        scale: '5ded6641c5e59f3214f9198f',
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
        both,
      }
      console.log(111)
      await this.userLinkModel.create(newUserLink)
    }))
    console.log('end')

    // console.log(data, 'aa')
    // return worksheet;

  }

  async uploadSocial(path: string, filename: string) {
    const workbook = XLSX.readFile(`${path}/${filename}`);
    const sheetNames = workbook.SheetNames;
    const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
    const client = this.redis.getClient()
    await Promise.all(data.map(async i => {
      const choice = i.choice

      const score = Number(choice)
      if (score === 0) { return }
      const user = await this.getUser(i.rater)
      if (!user) {
        return
      }
      const ratee = await this.getUser(i.ratee)
      if (!ratee) {
        return
      }
      const exist = await client.hget(i.ratee, i.rater)
      let both = false
      if (exist) {
        both = true
      }
      await client.hincrby(i.rater, i.ratee, 1)
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
        questionnaire: '5ded6cddc5e59f3214f91a08',
        //企业id
        companyProject: '5dee519c32b4424f46c3d59c',
        // 量表id
        scale: '5ded6ab2c5e59f3214f919cd',
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
        both,
      }
      console.log(111)
      await this.userLinkModel.create(newUserLink)
    }))
    console.log('end')

    // console.log(data, 'aa')
    // return worksheet;

  }

  async getUser(name: string) {
    const client = this.redis.getClient()
    const user = await client.hget('5dee46ad8670b9c75ee04225', name)
    if (user) {
      return JSON.parse(user)
    }
    return null
  }

  async genUser() {
    const users = await this.userService.findByCondition({ companyId: '5dee46ad8670b9c75ee04225' })
    const client = this.redis.getClient()
    await Promise.all(users.map(async user => {
      await client.hset('5dee46ad8670b9c75ee04225', user.userinfo.fullname, JSON.stringify(user))
    }))
  }



}