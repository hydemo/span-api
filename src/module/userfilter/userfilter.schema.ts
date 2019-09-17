import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserfilterSchema = new mongoose.Schema(
  {
    //题目类型
    subjectType: { type: String },
    //筛选类型
    filterType: {
      type: String, enum: [
        'organization',
        'user',
        'frequency',
      ]
    },
    //频率筛选条件
    filterScore: { type: Number },
    //筛选层级
    layer: { type: Number },
    //题目
    question: [{ content: String }],
    //筛选范围
    filterRange: {
      type: String, enum: [
        'leader',
        'staff',
        'all',
      ]
    },
    //引导语
    guide: { type: String },
    //量表id
    scale: { type: ObjectId },
    //分数
    score: [{
      score: Number
    }],
    //选项
    option: [{ content: String }],
    //是否必填
    required: { type: Boolean },
  },
  { collection: 'userfilter', versionKey: false, timestamps: true },
);

// UserfilterSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })