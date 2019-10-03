import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserProjectSchema = new mongoose.Schema(
  {
    // 企业计划Id
    companyProject: ObjectId,
    // 计划id
    project: ObjectId,
    // 用户id
    user: ObjectId,
    // 是否完成
    isCompleted: { type: Boolean, default: false },
    // 是否删除
    isDelete: { type: Boolean, default: false },
  },
  { collection: 'userProject', versionKey: false, timestamps: true },
);

// UserProjectSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })