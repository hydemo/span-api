import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const TagSchema = new mongoose.Schema(
  {
    tag: { type: String, trim: true, require: true, unique: true },
  },
  { collection: 'tag', versionKey: false, timestamps: true },
);

// TagSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })