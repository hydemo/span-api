import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const CompanyProjectSchema = new mongoose.Schema(
  {
    // 计划Id
    project: ObjectId,
    // 企业Id
    company: ObjectId,
    // 是否撤回
    isWithDraw: { type: Boolean, default: false },
    // 是否删除
    isDelete: { type: Boolean, default: false },
    // 问卷设置
    questionnaireSetting: [
      {
        qustionnaire: String,
        rater: [String],
        raterType: { type: String, enum: ['staff', 'leader', 'all'] },
        scales: [ObjectId],
        startTime: Date,
        endTime: Date,
        staffFeedback: {
          me: Boolean,
          sameDep: Boolean,
          sameDepNameVisiable: Boolean,
          otherDep: Boolean,
          otherDepNameVisiable: Boolean,
        },
        leaderFeedback: [{
          layer: Number,
          permissionType: Number
        }],
      }
    ]
  },
  { collection: 'companyProject', versionKey: false, timestamps: true },
);

// CompanyProjectSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })