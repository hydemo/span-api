import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const SubjectSchema = new mongoose.Schema(
  {
    //题目类型
    subjectType: { type: String },
    //量表id
    scale: { type: ObjectId },
    //题目
    question: [{ content: String }],
    //选项
    option: [{ content: String, optionNum: Number }],
    //页码
    page: { type: Number },
    //引导语
    guide: { type: String },
    //是否必填
    required: { type: Boolean },
    //总页数
    totalPage: { type: Number },
  },
  { collection: 'subject', versionKey: false, timestamps: true },
);

// SubjectSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })