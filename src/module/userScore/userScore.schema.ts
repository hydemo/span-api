import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserScoreSchema = new mongoose.Schema(
  {
    //用户id
    userId: { type: String },
    //用户名
    username: { type: String },
    //用户邮箱
    email: { type: String },
    //问卷id
    questionnaire: ObjectId,
    //企业id
    companyProject: ObjectId,
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
    score: [{ score: Number, scale: String }],
    //评价数
    evaluateNum: { type: Number },
  },
  { collection: 'userScore', versionKey: false, timestamps: true },
);

// UserScoreSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })