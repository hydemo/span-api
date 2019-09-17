import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const ScaleOptionSchema = new mongoose.Schema(
  {
    //创建者id
    creatorId: { type: String, required: true },
    //创建者姓名
    creatorName: { type: String, required: true },
    //标尺方案名称
    name: { type: String, required: true },
    //标尺
    option: [{ content: String }],
    //分数
    score: [{ score: Number }],
    //公开或者私有,默认私有
    isPublic: { type: Boolean, default: false },
    //引用次数
    referenceNum: { type: Number, default: 0 },
  },
  { collection: 'scaleOption', versionKey: false, timestamps: true },
);

// ScaleOptionSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })