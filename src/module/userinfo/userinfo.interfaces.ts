import { Document } from 'mongoose';

export interface IUserinfo extends Document {
  //题目类型
  readonly subjectType: string;
  //是否必填
  readonly required: boolean;
  //题目
  readonly question: [{ content: string }];
  //scale
  readonly scale: string;
  //选项
  readonly option: [{ content: string, optionNum: number }];
}