import { Document } from 'mongoose';

export interface IOrganizationScore extends Document {
  //部门id
  readonly organization: string;
  //部门名称
  readonly organizationName: string;
  //问卷id
  readonly questionnaire: string;
  //企业计划id
  readonly companyProject: string;
  //计划id
  readonly projectId: string;
  //分数
  readonly score: [{
    score: number,
    scale: string,
  }],
  //评价数
  readonly evaluateNum: number,
}