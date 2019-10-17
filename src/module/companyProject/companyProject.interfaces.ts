import { Document } from 'mongoose';

export interface ICompanyProject extends Document {
  // 计划Id
  readonly project: any;
  // 企业Id
  readonly company: string;
  // 问卷设置
  readonly questionnaireSetting: [
    {
      questionnaire: string,
      rater: string[],
      raterType: string[],
      scales: string,
      startTime: Date,
      endTime: Date,
      staffFeedback: string[],
      leaderFeedback: string[],
    }
  ]
}