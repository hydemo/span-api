import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const QuestionnaireSchema = new mongoose.Schema(
  {
    //问卷名称
    name: { type: String, trim: true },
    //创建者id
    creatorId: { type: String, trim: true },
    //创建者名称
    creatorName: { type: String, trim: true },
    //问卷类型(0:自评,1:筛选互评,2:互评,3:社会网络,4:筛选社会网络)
    category: { type: Number },
    //问卷引导语
    guide: { type: String },
    //描述
    description: { type: String, trim: true },
    //用户信息题目
    userinfo: [{ type: ObjectId }],
    //用户筛选题目
    userfilter: [{ type: ObjectId }],
    //题目
    subject: [{ type: ObjectId }],
    //语言
    language: { type: String, trim: true },
    //备注
    note: { type: String, trim: true },
    //是否公开默认私有
    isPublic: { type: Boolean, default: false },
    //归档
    isArchive: { type: Boolean, default: false },
    //引用次数
    referenceNum: { type: Number, default: 0 },
  },
  { collection: 'questionnaire', versionKey: false, timestamps: true },
);

// QuestionnaireSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })