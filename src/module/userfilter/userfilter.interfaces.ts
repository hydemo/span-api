import { Document } from 'mongoose';

export interface IUserfilter extends Document {
  //题目类型
  readonly subjectType: string;
  //筛选类型
  readonly filterType: string;
  //频率筛选条件
  readonly filterScore: number;
  //筛选层级
  readonly layer: number;
  //题目
  readonly question: [{ content: string }];
  //筛选范围
  readonly filterRange: string;
  //引导语
  readonly guide: string;
  //量表id
  readonly scale: string;
  //分数
  readonly score: [{
    score: number
  }];
  //选项
  readonly option: [{ content: string }];
  //是否必填
  readonly required: boolean;
}