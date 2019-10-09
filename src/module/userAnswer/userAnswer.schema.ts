import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserAnswerSchema = new mongoose.Schema(
  {
    //评价人id
    raterId: ObjectId,
    //评价人姓名
    raterName: { type: String },
    //评价人邮箱
    raterEmail: { type: String },
    //被评价人id
    rateeId: ObjectId,
    //被评价人邮箱
    rateeEmail: { type: String },
    //被评价人姓名
    rateeName: { type: String },
    //被评价对象类型
    rateeType: { type: String },
    //用户问卷id
    userQuestionnaireId: ObjectId,
    //问卷id
    questionnaire: ObjectId,
    //企业项目id
    companyProject: ObjectId,
    //用户答案
    answer: [{
      questionId: ObjectId,
      type: { type: String },
      choice: [{ questionId: String, optionId: String, scoreMethod: String, content: String }],
      scaleId: { type: String },
    }],
    //分数
    score: [{
      scale: String,
      score: Number,
    }],
    //完成时间
    completeTime: { type: Number },
    //当前周期数
    sequence: { type: Number, default: undefined },
  },
  { collection: 'userAnswer', versionKey: false, timestamps: true },
);

// UserAnswerSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })