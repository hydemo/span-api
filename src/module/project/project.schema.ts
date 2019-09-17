import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const ProjectSchema = new mongoose.Schema(
  {
    // 计划名称
    name: { type: String },
    // 创建者id 教授账号Id
    creatorId: { type: ObjectId },
    // 创建人姓名
    creatorName: { type: String },
    // 描述
    description: { type: String },
    //封面图片
    coverImages: String,
    // 是否是周期
    periodicity: { type: Boolean, default: false },
    // 周期信息
    periodicityInfo: {
      //周期方法: days,months,weeks,
      timeMethod: { type: String },
      //间隔 
      interval: Number,
      //作答时间限制 :{startTime：HH:mm:ss, lowTime:HH:mm:ss } 限制小于周期
      limit: {
        startTime: String,
        time: Number,
      },
      //次数
      frequency: Number,
    },
    //当前周期数
    sequence: { type: Number, default: undefined },

    isGroup: { type: Boolean, default: false },
    //归档
    isArchive: { type: Boolean, default: false },
    // 问卷列表
    questionnaires: [
      {
        // 问卷Id
        questionnaireId: ObjectId,
        // 问卷名称
        questionnaireName: String,
        //初始层级
        initLayer: Number,
        // 分配范围
        ranges: Array,
        // 分配范围key
        rangesKey: Array,
        // 评价对象
        rateeType: Number,
      }
    ],
    //引用次数
    referenceNum: { type: Number, default: 0 },
  },
  { collection: 'project', versionKey: false, timestamps: true },
);

// ProjectSchema.pre('save', function (result: any) {
//   if (!result.companyId)
//     result.companyId = result._id
// })