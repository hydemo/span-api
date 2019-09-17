import { Document } from 'mongoose';

export interface ISubject extends Document {
  //题目类型
  readonly subjectType: string;
  //题目
  readonly question: [{ content: string }];
  //量表id
  readonly scale: string;
  //选项
  readonly option: [{ content: string }];
  //页码
  readonly page: number;
  //是否必填
  readonly required: boolean;
  //总页数
  readonly totalPage: number;
  //引导语
  readonly guide: string;
}