import { Document } from 'mongoose';
import { IProject } from '../project/project.interfaces';
import { IUser } from '../user/user.interfaces';

export interface IUserProject extends Document {
  // 企业计划Id
  readonly companyProject: string;
  // 计划Id
  readonly project: IProject;
  // 用户id
  readonly user: IUser;
  // 是否完成
  readonly isCompleted: boolean;
  // 是否删除
  readonly isDelete: boolean;
}