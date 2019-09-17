import { Document } from 'mongoose';

export interface ICompany extends Document {
  // 姓名
  readonly username: string;
  // 邮箱
  readonly email: string;
  // 联系电话
  readonly phone: string;
  // 密码
  password: string;
  // 头像
  readonly avatar?: string;
  // 注册时间
  readonly addTime: Date;
  // 最后登录时间
  readonly lastLoginTime: Date;
  // 最后登录ip
  readonly lastLoginIp: string;

  accessToken: string;

  isDelete: boolean;
  deleteTime: Date;
  // 企业id
  companyId: string;
  //企业名
  readonly companyName: string;
  //所属行业
  readonly industry: string;
}