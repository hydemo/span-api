import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const OrganizationSchema = new mongoose.Schema(
  {
    //企业id
    companyId: ObjectId,
    //组织名称
    name: { type: String },
    //组织所在层级
    layer: { type: Number },
    //层级名称
    layerLength: { type: Number },
    //所有者id
    ownerId: { type: String },
    //所有者名称
    ownerName: { type: String },
    //组织的上层id
    parent: ObjectId,
    //组织的下层id
    children: [{ ObjectId }],
    //员工数
    staffNumber: { type: Number },
    //生成者id
    producerId: { type: String },
    // 是否有子集
    hasChildren: { type: Boolean, default: false },
    // 是否有用户
    hasUser: { type: Boolean, default: false },
    //是否删除
    isDelete: { type: Boolean, default: false },
  },
  { collection: 'organization', versionKey: false, timestamps: true },
);

// OrganizationSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })