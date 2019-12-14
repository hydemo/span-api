import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IProject } from './project.interfaces';
import { CreateProjectDTO } from './project.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { ICompany } from '../company/company.interfaces';
import { CompanyProjectService } from '../companyProject/companyProject.service';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('ProjectModelToken') private readonly projectModel: Model<IProject>,
    @Inject(QuestionnaireService) private readonly questionnaireService: QuestionnaireService,
  ) { }

  // 创建数据
  async create(project: CreateProjectDTO, creator: IAdmin) {
    const {
      name,
      description,
      questionnaires,
      periodicity,
      periodicityInfo,
      coverImages,
      fee,
    } = project;

    for (let questionnaire of questionnaires) {
      let question: any = {};
      question.questionnaireId = questionnaire.questionnaireId;
      question.questionnaireName = questionnaire.questionnaireName;
    }
    const object: any = {
      name: name,
      description,
      creatorId: creator._id,
      creatorName: creator.username,
      questionnaires,
      periodicity,
      periodicityInfo,
      coverImages
    };

    if (periodicity) {
      object.sequence = 1;
      if (!periodicityInfo.timeMethod || !periodicityInfo.interval || !periodicityInfo.frequency) {
        return { status: 400, code: 4265 };
      }
    }

    for (let v of questionnaires) {
      const questionnaire = await this.questionnaireService.findById(
        v.questionnaireId
      );
      if (!questionnaire) {
        throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
      }
      if (questionnaire.category === 2 && !v.rateeType) {
        return { status: 400, code: 4263 };
      }
    }
    await Promise.all(
      questionnaires.map(async v => {
        await this.questionnaireService.incReference(v.questionnaireId, 1);
      }));
    //无关联生成project
    await this.projectModel.create(object);
    return { status: 200, code: 2125 };
  }

  // 删除数据
  async deleteById(id: string, userId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      return { status: 200, code: 2126 }
    }
    if (String(project.creatorId) !== String(userId)) {
      throw new ApiException('NO Permission', ApiErrorCode.NO_PERMISSION, 403)
    }

    if (project.referenceNum) {
      return { status: 400, code: 4133 }
    }
    for (let questionnaire of project.questionnaires) {
      await this.questionnaireService.incReference(questionnaire.questionnaireId, -1)
    }
    await this.projectModel.findByIdAndDelete(id);
    return { status: 200, code: 2126 }
  }

  // 查询全部数据
  async findById(id: string) {
    const project = await this.projectModel.findById(id).lean().exec()
    if (!project) {
      return null
    }

    await Promise.all(project.questionnaires.map(async (questionnaire) => {
      const questionnaireDetail = await this.questionnaireService.findById(questionnaire.questionnaireId)
      if (!questionnaireDetail) {
        return
      }
      questionnaire.type = questionnaireDetail.category
    }))
    return project;
  }

  // 查询全部数据
  async list(pagination: Pagination, isArchive: boolean) {
    const search = [
      { name: new RegExp(pagination.value || '', 'i') },
      { creatorName: new RegExp(pagination.value || '', 'i') },
    ];
    const condition = { $or: search, isArchive }

    const projects = await this.projectModel
      .find(condition)
      .sort({ createdAt: -1 })
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .lean()
      .exec()
    const total = await this.projectModel.countDocuments(condition)
    return { projects, total };
  }

  // 企业计划列表
  async projectsForCompany(pagination: Pagination) {

    const condition = { isArchive: false }

    const projects = await this.projectModel
      .find(condition)
      .sort({ createdAt: -1 })
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .populate({ path: 'questionnaires.questionnaireId', model: 'questionnaire' })
      .lean()
      .exec()
    const total = await this.projectModel.countDocuments(condition)
    return { projects, total };
  }




  // 归档
  async archive(id) {
    return await this.projectModel.findByIdAndUpdate(id, { isArchive: true })
  }

  // 复原
  async recover(id) {
    return await this.projectModel.findByIdAndUpdate(id, { isArchive: false })
  }

  // 增量
  async incReference(id: string, inc: number) {
    return await this.projectModel.findByIdAndUpdate(id, { $inc: { referenceNum: inc } })
  }

  // 增量
  async assignType(category: number) {
    let assigns = new Array();
    const defaultAssigns = [
      {},
      { isLeader: true },
      { isLeader: false }
    ];
    const assignForEmployees = [{ isLeader: false }];
    let append = this.assignsForLeaders(3);
    switch (Number(category)) {
      // 自评  
      case 0:
        assigns = assigns.concat(defaultAssigns, append);
        break;
      // 社会网络问卷
      case 1:
        assigns = assigns.concat(defaultAssigns, append);
        break;
      // 上级部门领导评价下级部门领导
      case 2:
        append.pop();
        assigns = append;
        break;
      // 上级部门领导评价下级部门员工
      case 3:
        assigns = append;
        break;
      // 同级员工互评
      case 4:
        assigns = assignForEmployees;
        break;
      // 同级领导互评
      case 5:
        assigns = append;
        break;
      // 下级部门领导评价上级部门领导
      case 6:
        append.shift();
        assigns = append;
        break;
      //员工评价上级部门领导
      case 7:
        assigns = assignForEmployees;
        break;
      default:
        assigns = [];
    }
    return assigns;
  }

  assignsForLeaders(length) {
    let assigns = new Array();
    for (let i = 1; i <= length; i++) {
      let object = {
        layer: i,
        isLeader: true
      }
      assigns.push(object)
    }
    return assigns;
  }


}