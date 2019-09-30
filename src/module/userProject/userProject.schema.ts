import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserProjectSchema = new mongoose.Schema(
  {
    // 企业计划Id
    companyProject: ObjectId,
    // 用户id
    user: ObjectId,
    // 是否完成
    isCompleted: Boolean,
    // 是否删除
    isDelete: Boolean,
  },
  { collection: 'userProject', versionKey: false, timestamps: true },
);

// UserProjectSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })