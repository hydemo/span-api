import { Document } from 'mongoose';

export interface ICompanyProject extends Document {
  // 计划Id
  readonly project: string;
  // 企业Id
  readonly company: string;
  // 问卷设置
  readonly questionnaireSetting: [
    {
      qustionnaire: string,
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