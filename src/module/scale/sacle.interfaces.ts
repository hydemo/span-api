import { Document } from 'mongoose';

export interface IScale extends Document {
  //量表类型
  scaleType: string;
  //题目类型
  subjectType: string;
  //筛选类型
  filterType: string;
  //频率筛选条件
  filterScore: number;
  //筛选层级
  layer: number;
  //是否领导
  filterRange: string;
  //创建者id
  creatorId: string;
  //创建者姓名
  creatorName: string;
  //量表id
  scaleId: string;
  //量表名称
  name: string;
  //引导语
  guide: string;
  //描述
  description: string;
  //问题
  question: [string];
  //标尺
  option: [{ content: string }];
  //分数
  score: [{ score: string }];
  //反馈
  feedback: [
    {
      upper: number,
      lower: number,
      recommend: string,
      evaluation: string
    }
  ];
  //社会网络筛选指标：DegCent,IDegCent,ODegCent,EgCent,CloCent,BetCent,KBetCent,
  //AveNeiDeg,PagLink,Dens,Cenrliza,CenrlizaIn,CenrlizaOut
  socialFeedback: [ISocialFeedback],
  //反馈类型
  feedbackType: string;
  //生成反馈百分比
  rateToFeedback: number;
  //公开或者私有,默认私有
  isPublic: boolean;
  //归档
  isArchive: boolean;
  //标签
  tag: [string];
  //量表来源
  source: string;
  //备注
  note: string;
  //版本全名
  version: number;
  //是否删除
  isDelete: boolean;
  //是否最新版本
  isNewest: boolean;
  //上一版本id
  preVersionId: string;
  //引用次数
  referenceNum: number;
  //版本更新信息
  changeLog: string;
  //语言
  language: string;
}

export interface ISocialFeedback {

  name: string;
  type: number;
  description: string;
  evaluate: [
    {
      upper: number,
      lower: number,
      recommend: string,
      evaluation: string,
    }
  ]
}