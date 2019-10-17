import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserLinkSchema = new mongoose.Schema(
  {
    //评价人
    raterId: { type: String },
    //评价人姓名
    raterName: { type: String },
    //被评价人
    rateeId: { type: String },
    //被评价人姓名
    rateeName: { type: String },
    //问卷id
    questionnaire: ObjectId,
    //企业id
    companyProject: ObjectId,
    // 量表id
    scale: String,
    //层级线
    layerLine: [{
      //层级id
      layerId: String,
      //层级
      layer: Number,
      //组织名称
      layerName: String,
      //父节点id
      parentId: String,
    }],
    // 部门id
    layerId: { type: String },
    //分数
    score: Number,
    // 双向链接
    both: { type: Boolean, default: false },
  },
  { collection: 'userLink', versionKey: false, timestamps: true },
);

// UserLinkSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })