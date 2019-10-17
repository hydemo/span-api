import { Document } from 'mongoose';

export interface IUserScore extends Document {
  //用户id
  readonly userId: string;
  //用户名
  readonly username: string;
  //用户邮箱
  readonly email: string;
  //问卷id
  readonly questionnaire: string;
  //企业计划id
  readonly companyProject: string;
  //部门id
  readonly layerId: string;
  //分数
  readonly score: [{ score: number, scale: string }];
  //评价数
  readonly evaluateNum: string;
}