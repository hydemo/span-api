import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserQuestionnaireSchema = new mongoose.Schema(
  {
    //问卷id
    questionnaireId: ObjectId,
    //项目id
    companyProject: ObjectId,
    //用户id
    userId: ObjectId,
    //用户名
    username: { type: String },
    //用户邮箱
    email: { type: String },
    //已完成评价的id
    completeRateeId: [String],
    //用户信息答案
    userinfoChoice: [{
      questionId: ObjectId,
      choice: [{ optionId: String, content: String }],
    }],
    //用户信息答案
    userfilterChoice: [[{
      choose: String,
      content: String,
      email: String,
      rateeType: String,
      id: String,
    }]],
    //是否完成
    isCompleted: { type: Boolean, default: false },
    //是否删除(超级员)
    isDelete: { type: Boolean, default: false },
    //选择id
    choice: [{ content: String, email: String, id: String, rateeType: String }],
    //当前步骤
    current: { type: String, default: 'userinfo' },
    //开始事件
    startTime: { type: Date },
    // 是否是周期
    periodicity: { type: Boolean, default: false },
    //当前周期数
    sequence: { type: Number, default: undefined },
    //周期开始时间 moment格式 YYYY-MM-DD HH:mm:ss 
    periodicityStartTime: { type: String, default: undefined },
    //是否过期
    isOverdue: { type: Boolean, default: false },
    // 计划开始时间
    projectStartTime: Date,
    // 计划结束时间
    projectEndTime: Date,
  },
  { collection: 'userQuestionnaire', versionKey: false, timestamps: true },
);

// UserQuestionnaireSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })