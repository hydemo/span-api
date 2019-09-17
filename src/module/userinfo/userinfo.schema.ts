import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserinfoSchema = new mongoose.Schema(
  {
    //题目类型
    subjectType: { type: String },
    //是否必填
    required: { type: Boolean },
    //题目
    question: [{ content: String }],
    //scale
    scale: { type: ObjectId, ref: 'scale' },
    //选项
    option: [{ content: String, optionNum: Number }],
  },
  { collection: 'userinfo', versionKey: false, timestamps: true },
);

// UserinfoSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })