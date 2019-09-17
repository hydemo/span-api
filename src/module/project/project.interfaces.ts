import { Document } from 'mongoose';

export interface IProject extends Document {
  // 计划名称
  readonly name: string;
  // 创建者id 教授账号Id
  readonly creatorId: string;
  // 创建人姓名
  readonly creatorName: string;
  // 描述
  readonly description: string;
  //封面图片
  readonly coverImages: string;
  // 是否是周期
  readonly periodicity: boolean;
  // 周期信息
  readonly periodicityInfo: {
    //周期方法: days,months,weeks,
    timeMethod: string,
    //间隔 
    interval: number,
    //作答时间限制 :{startTime：HH:mm:ss, lowTime:HH:mm:ss } 限制小于周期
    limit: {
      startTime: string,
      time: number,
    },
    //次数
    frequency: number,
  };
  //当前周期数
  readonly sequence: number;

  readonly isGroup: boolean;
  //归档
  readonly isArchive: boolean;
  // 问卷列表
  readonly questionnaires:
  {
    // 问卷Id
    questionnaireId: string,
    // 问卷名称
    questionnaireName: string,
    //初始层级
    initLayer: number,
    // 分配范围
    ranges: any[],
    // 分配范围key
    rangesKey: any[],
    // 评价对象
    rateeType: number,
    type: number
  }[];
  //引用次数
  readonly referenceNum: number,
}