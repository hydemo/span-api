import { Document } from 'mongoose';

export interface IScaleOption extends Document {
  //创建者id
  readonly creatorId: string;
  //创建者姓名
  readonly creatorName: string;
  //标尺方案名称
  readonly name: string;
  //标尺
  readonly option: [{ content: string }];
  //分数
  readonly score: [{ score: number }];
  //公开或者私有,默认私有
  readonly isPublic: boolean;
  //引用次数
  readonly referenceNum: number;
}