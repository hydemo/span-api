import { Document } from 'mongoose';

export interface IUserLink extends Document {
  //评价人
  readonly raterId: string;
  //评价人姓名
  readonly raterName: string;
  //被评价人
  readonly rateeId: string;
  //被评价人姓名
  readonly rateeName: string;
  //问卷id
  readonly questionnaire: string;
  //企业id
  readonly companyProject: string;
  // 量表id
  readonly scale: string;
  // 双向链接
  readonly both: boolean;
  //层级线
  readonly layerLine: [{
    //层级id
    layerId: string,
    //层级
    layer: number,
    //组织名称
    layerName: string,
    //父节点id
    parentId: string,
  }],
  // 部门id
  readonly layerId: string;
  //分数
  readonly score: number,
}