import { Document } from 'mongoose';

export interface IUserProject extends Document {
  // 企业计划Id
  readonly companyProject: string;
  // 计划Id
  readonly project: string;
  // 用户id
  readonly user: string;
  // 是否完成
  readonly isCompleted: boolean;
  // 是否删除
  readonly isDelete: boolean;
}