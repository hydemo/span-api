import { Document } from 'mongoose';

export interface IUserAnswer extends Document {
  //评价人id
  readonly raterId: string;
  //评价人姓名
  readonly raterName: string;
  //评价人邮箱
  readonly raterEmail: string;
  //被评价人id
  readonly rateeId: string;
  //被评价人邮箱
  readonly rateeEmail: string;
  //被评价人姓名
  readonly rateeName: string;
  //被评价对象类型
  readonly rateeType: string;
  //用户问卷id
  readonly userQuestionnaireId: string;
  //问卷id
  readonly questionnaire: string;
  //企业项目id
  readonly companyProject: string;
  //用户答案
  readonly answer: [{
    questionId: string;
    type: string;
    choice: [{ questionId: string, optionId: string, scoreMethod: string, content: string }],
    scaleId: string;
  }];
  //分数
  readonly score: [{
    scale: string,
    score: number,
  }];
  //完成时间
  readonly completeTime: number;
  //当前周期数
  readonly sequence: number;
}