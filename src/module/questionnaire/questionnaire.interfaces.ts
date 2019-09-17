import { Document } from 'mongoose';

export interface IQuestionnaire extends Document {
  //问卷名称
  readonly name: string;
  //创建者id
  readonly creatorId: string;
  //创建者名称
  readonly creatorName: string;
  //问卷类型(0:自评,1:筛选互评,2:互评,3:社会网络,4:筛选社会网络)
  readonly category: number;
  //问卷引导语
  readonly guide: string;
  //描述
  readonly description: string;
  //用户信息题目
  userinfo: any[];
  //用户筛选题目
  userfilter: any[];
  //题目
  subject: any[];
  //语言
  readonly language: string;
  //备注
  readonly note: string;
  //是否公开默认私有
  readonly isPublic: boolean;
  //归档
  readonly isArchive: boolean;
  //引用次数
  readonly referenceNum: number;
}