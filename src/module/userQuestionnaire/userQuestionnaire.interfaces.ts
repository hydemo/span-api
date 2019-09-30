import { Document } from 'mongoose';

export interface IUserQuestionnaire extends Document {
  //问卷id
  readonly questionnaireId: string;
  //项目id
  companyProject: string;
  //用户id
  userId: string;
  //用户名
  username: string;
  //用户邮箱
  email: string;
  //已完成评价的id
  completeRateeId: [string],
  //用户信息答案
  userinfoChoice: [{
    questionId: string;
    choice: [{ optionId: string, content: string }],
  }],
  //用户信息答案
  userfilterChoice: [[{
    choose: string,
    content: string,
    email: string,
    rateeType: string,
    id: string,
  }]],
  //是否完成
  isCompleted: boolean;
  //是否删除(超级员)
  isDelete: boolean;
  //选择id
  choice: [{ content: string, email: string, id: string, rateeType: string }],
  //当前步骤
  current: string;
  //开始事件
  startTime: Date;
  // 是否是周期
  periodicity: boolean;
  //当前周期数
  sequence: number;
  //周期开始时间 moment格式 YYYY-MM-DD HH:mm:ss 
  periodicityStartTime: { type: string, default: undefined },
  //是否过期
  isOverdue: boolean;
  // 计划开始时间
  projectStartTime: Date;
  // 计划结束时间
  projectEndTime: Date;
}