import * as mongoose from 'mongoose';
import { string, number } from 'joi';

const ObjectId = mongoose.Types.ObjectId;

export const OrganizationScoreSchema = new mongoose.Schema(
  {
    //部门
    organization: ObjectId,
    //部门名称
    organizationName: String,
    //问卷id
    questionnaire: ObjectId,
    //企业计划id
    companyProject: ObjectId,
    //分数
    score: [{
      score: Number,
      scale: String
    }],
    //评价数
    evaluateNum: Number,
  },
  { collection: 'organizationScore', versionKey: false, timestamps: true },
);

// OrganizationScoreSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })