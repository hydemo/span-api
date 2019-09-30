import { Model } from 'mongoose'
import * as _ from 'lodash'
import { Inject, Injectable } from '@nestjs/common'
import { IQuestionnaire } from './questionnaire.interfaces';
import { CreateQuestionnaireDTO } from './questionnaire.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { UserfilterService } from '../userfilter/userfilter.service';
import { UserinfoService } from '../userinfo/userinfo.service';
import { SubjectService } from '../subject/subject.service';
import { ScaleService } from '../scale/scale.service';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';

@Injectable()
export class QuestionnaireService {
  constructor(
    @Inject('QuestionnaireModelToken') private readonly questionnaireModel: Model<IQuestionnaire>,
    @Inject(UserfilterService) private readonly userfilterService: UserfilterService,
    @Inject(UserinfoService) private readonly userinfoService: UserinfoService,
    @Inject(SubjectService) private readonly subjectService: SubjectService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
  ) { }

  // 创建数据
  async create(questionnaire: CreateQuestionnaireDTO, creator: IAdmin) {
    const {
      questionnaires,
      userinfos = "",
      userfilters = "",
      subjects
    } = questionnaire;
    const newQuestionnaire = await this.questionnaireModel.create({ ...questionnaires, creatorId: creator._id, creatorName: creator.username });
    //添加用户信息
    if (userinfos && userinfos.length) {
      let userinfoArray: any = []
      for (let userinfo of userinfos) {
        let createUserinfo: any = userinfo
        if (userinfo._id) {
          await this.scaleService.incReference(userinfo._id, 1);
          createUserinfo = { scale: userinfo._id }
        }
        const newUserinfo = await this.userinfoService.create(createUserinfo);
        userinfoArray.push(newUserinfo._id)
      }
      await this.questionnaireModel.findByIdAndUpdate(newQuestionnaire._id, { userinfo: userinfoArray })
      //添加用户过滤
    }
    if (userfilters && userfilters.length) {
      let userfilterArray: any = []
      for (let userfilter of userfilters) {
        let createUserfilter: any = userfilter
        if (userfilter._id) {
          await this.scaleService.incReference(userfilter._id, 1);
          createUserfilter = { scale: userfilter._id }
        }
        const newUserfilter = await this.userfilterService.create(createUserfilter);
        userfilterArray.push(newUserfilter._id)
      }
      await this.questionnaireModel.findByIdAndUpdate(newQuestionnaire._id, { userfilter: userfilterArray })
    }
    //添加用户自定义题目，
    if (subjects && subjects.length) {
      let subjectArray: any = []
      for (let subject of subjects) {
        let createSubject: any = subject
        if (subject._id) {
          await this.scaleService.incReference(subject._id, 1);
          createSubject = { scale: subject._id }
        }
        const newSubject = await this.subjectService.create(createSubject);
        subjectArray.push(newSubject._id)
      }
      await this.questionnaireModel.findByIdAndUpdate(newQuestionnaire._id, { subject: subjectArray })
    }
    return { status: 200, code: 2041 };
  }

  // 根据标签名获取
  async findById(id: string): Promise<IQuestionnaire | null> {
    return await this.questionnaireModel.findById(id)
  }


  // 根据标签名获取
  async getFullQuestionnaireById(id: string): Promise<IQuestionnaire | null> {
    const fullQuestionnaire: IQuestionnaire | null = await this.questionnaireModel
      .findById(id)
      .populate({ path: 'userinfo', model: 'userinfo', populate: { path: 'scale', model: 'scale' } })
      .populate({ path: 'userfilter', model: 'userfilter', populate: { path: 'scale', model: 'scale' } })
      .populate({ path: 'subject', model: 'subject', populate: { path: 'scale', model: 'scale' } })
    if (!fullQuestionnaire) {
      return null
    }
    fullQuestionnaire.userinfo = fullQuestionnaire.userinfo.map(v => {
      if (v.scale) {
        return Object.assign(v.scale, {
          required: v.required
        });
      } else {
        return v;
      }
    });
    fullQuestionnaire.userfilter = fullQuestionnaire.userfilter.map(v => {
      if (v.scale) {
        return Object.assign(v.scale, {
          required: v.required
        });
      } else {
        return v;
      }
    });
    fullQuestionnaire.subject = fullQuestionnaire.subject.map(v => {
      if (v.scale) {
        return Object.assign(v.scale, {
          page: v.page,
          totalPage: v.totalPage,
          required: v.required
        });
      } else {
        return v;
      }
    });
    return fullQuestionnaire;

  }

  // 获取用户信息题
  async getUserinfo(id: string) {
    const questionnaire = await this.questionnaireModel.findById(id)
      .populate({
        path: "userinfo",
        model: "userinfo",
        populate: {
          path: "scale"
        }
      })
      .select({ userinfo: 1 })
      .exec();
    if (!questionnaire) {
      return null
    }
    return questionnaire.userinfo.map(v => {
      if (v.scale) return Object.assign(v.scale, { required: v.required });
      else return v;
    });
  }

  // 获取筛选题
  async getUserfilter(id: string, subjectNum: number, choiceObject?: any, type?: string) {
    const questionnaire = await this.questionnaireModel.findById(id);
    if (!questionnaire) {
      return null
    }
    let choice: any = []
    let prefilterId;
    let preuserfilter;
    if (subjectNum > 1) {
      prefilterId = questionnaire.userfilter[subjectNum - 2];
      preuserfilter = await this.userfilterService.getUserfilter(prefilterId);
      if (preuserfilter.scale) {
        preuserfilter = preuserfilter.scale;
      }
      if (preuserfilter.filterType === "frequency") {
        const option = JSON.parse(JSON.stringify(preuserfilter.option));
        const score = preuserfilter.score;
        choiceObject = choiceObject
          .map(v => {
            const index = _.findIndex(option, {
              _id: v.optionId
            });
            if (score[index].score >= preuserfilter.filterScore) {
              return {
                content: v.content,
                rateeType: v.rateeType
              };
            } else {
              return;
            }
          })
          .filter(v => v);
      }
    }
    if (subjectNum > questionnaire.userfilter.length) {
      return {
        choice: choiceObject
      };
    }
    const filterId = questionnaire.userfilter[subjectNum - 1];
    let userfilter = await this.userfilterService.getUserfilter(filterId);
    if (userfilter.scale) {
      userfilter = userfilter.scale;
    }
    if (subjectNum === 1) {
      if (userfilter.filterType === "organization") {
        for (let i = 0; i < 6; i++) {
          choice.push({
            content: `org${i + 1}`,
            rateeType: "organization"
          });
        }
      } else {
        for (let i = 0; i < 6; i++) {
          choice.push({
            content: `user${i + 1}`,
            rateeType: "user"
          });
        }
      }
    } else if (subjectNum <= questionnaire.userfilter.length) {
      if (userfilter.filterType !== "organization") {
        if (preuserfilter.filterType === "organization") {
          choiceObject.map(v => {
            for (let i = 0; i < 6; i++) {
              choice.push({
                content: `${v.content}-user${i + 1}`,
                rateeType: "user"
              });
            }
          });
        } else {
          choice = choiceObject;
        }
      } else {
        if (preuserfilter.filterType === "organization") {
          choiceObject.map(v => {
            for (let i = 0; i < 6; i++) {
              choice.push({
                content: `${v.content}-org${i + 1}`,
                rateeType: "organization"
              });
            }
          });
        }
      }
    }
    if (userfilter.filterType !== "frequency") {
      return {
        subjectType: userfilter.subjectType,
        question: userfilter.question,
        option: choice,
        totalPage: questionnaire.userfilter.length
      };
    } else {
      return {
        subjectType: "scale",
        guide: userfilter.guide,
        question: choice,
        option: userfilter.option,
        totalPage: questionnaire.userfilter.length
      };
    }
  }

  /* 获取问卷题目 */

  async getSubject(id: string, choice: any[]) {
    choice = choice.map(c => JSON.parse(c));
    const questionnaireDetail = await this.questionnaireModel.findById(id)
    if (!questionnaireDetail) {
      return null
    }
    const { category } = questionnaireDetail;
    if (category === 3) {
      choice = [];
      for (let i = 0; i < 6; i++) {
        choice.push({
          content: `user${i + 1}`,
          rateeType: "user",
          id: "",
          email: ""
        });
      }
    }
    const questionnaire = await this.questionnaireModel.findById(id)
      .populate({
        path: "subject",
        model: "subject",
        populate: { path: "scale", model: "scale" }
      })
      .lean()
      .exec();
    const subject = questionnaire.subject.map(v => {
      if (v.scale) {
        let subjectType;
        if (
          v.scale.scaleType === "baseScale" ||
          v.scale.scaleType === "socialScale"
        ) {
          subjectType = "scale";
        } else {
          subjectType = v.scale.subjectType;
        }
        return Object.assign(v.scale, {
          page: v.page,
          totalPage: v.totalPage,
          subjectType,
          required: v.required
        });
      } else return v;
    });
    if (questionnaire.category === 3 || questionnaire.category === 4) {
      const question = choice.map(c => {
        return {
          _id: c.id,
          content: c.content,
          scoreMethod: "forward",
          email: c.email,
          rateeType: c.rateeType
        };
      });
      subject.map(sub => {
        sub.question = question;
        sub.subjectType = "scale";
        return sub;
      });
    }
    return subject;
  }

  // 删除企业
  async deleteById(id: string) {
    const questionnaireExist = await this.questionnaireModel.findById(id);
    if (questionnaireExist && questionnaireExist.referenceNum) {
      return { status: 400, code: 4056 };
    }
    const questionnaire: IQuestionnaire | null = await this.questionnaireModel
      .findById(id)
      .populate({ path: 'userinfo', model: 'userinfo', populate: { path: 'scale', model: 'scale' } })
      .populate({ path: 'userfilter', model: 'userfilter', populate: { path: 'scale', model: 'scale' } })
      .populate({ path: 'subject', model: 'subject', populate: { path: 'scale', model: 'scale' } })
    if (!questionnaire) {
      return { status: 200, code: 2042 }
    }
    const { userinfo = [], userfilter = [], subject = [] } = questionnaire;
    if (userinfo.length) {
      for (let info of userinfo) {
        if (info.scale) {
          await this.scaleService.incReference(info.scale, -1);
        }
        await this.userinfoService.deleteById(info._id);
      }
    }
    if (userfilter.length) {
      for (let filter of userfilter) {
        if (filter.scale) {
          await this.scaleService.incReference(filter.scale, -1);
        }
        await this.userfilterService.deleteById(filter._id);
      }
    }
    if (subject.length) {
      for (let sub of subject) {
        if (sub.scale) {
          await this.scaleService.incReference(sub.scale, -1);
        }
        await this.subjectService.deleteById(sub._id);
      }
    }
    await this.questionnaireModel.findByIdAndDelete(id);
    return { status: 200, code: 2042 }
  }

  // 查询全部数据
  async list(pagination: Pagination, creatorId: string, isArchive: boolean) {
    const search = [{ name: new RegExp(pagination.value || '', "i") }];
    const select = {
      name: 1,
      category: 1,
      referenceNum: 1,
      creatorName: 1
    };

    const condition = {
      $or: search,
      creatorId,
      isArchive,
    };
    const questionnaires = await this.questionnaireModel
      .find(condition)
      .sort({ createdAt: -1 })
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .select(select)
      .lean()
      .exec()
    const total = await this.questionnaireModel.countDocuments(condition)
    return { questionnaires, total };
  }

  // 归档
  async archive(id) {
    return await this.questionnaireModel.findByIdAndUpdate(id, { isArchive: true })
  }

  // 复原
  async recover(id) {
    return await this.questionnaireModel.findByIdAndUpdate(id, { isArchive: false })
  }

  // 增量
  async incReference(id: string, inc: number) {
    return await this.questionnaireModel.findByIdAndUpdate(id, { $inc: { referenceNum: inc } })
  }
  // 获取带反馈量表
  async getScale(id: string) {
    const questionnaire = await this.questionnaireModel
      .findById(id)
      .populate({ path: 'subject', model: 'subject', populate: { path: 'scale', model: 'scale' } })
      .populate({ path: 'userfilter', model: 'userfilter', populate: { path: 'scale', model: 'scale' } })
      .lean()
      .exec()
    console.log(questionnaire, 'ques')
    if (!questionnaire) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }
    let scales: any = [];
    questionnaire.subject.map(async v => {
      if (v.scale) {
        if (v.scale.scaleType === "socialScale") {
          if (v.scale.socialFeedback && v.scale.socialFeedback.length > 0) {
            scales.push({ name: v.scale.name, id: v.scale._id });
          }
        } else {
          if (v.scale.feedback && v.scale.feedback.length > 0) {
            scales.push({ name: v.scale.name, id: v.scale._id });
          }
        }
      }
    });
    questionnaire.userfilter.map(async v => {
      if (v.scale) {
        if (v.scale.socialFeedback && v.scale.socialFeedback.length > 0) {
          scales.push({ name: v.scale.name, id: v.scale._id });
        }
      }
    });
    return scales
  }
}