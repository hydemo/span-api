import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { SocialFeedbackSchema } from './socialFeedback.schema';
import { IScale } from './sacle.interfaces';

const ObjectId = mongoose.Types.ObjectId;

export const ScaleSchema = new mongoose.Schema(
  {
    //量表类型
    scaleType: {
      type: String,
      enum: [
        "baseScale",
        "infoScale",
        "filterScale",
        "customizeScale",
        "socialScale"
      ]
    },
    //题目类型
    subjectType: {
      type: String,
      enum: ["singlechoice", "multiplechoice", "text", "answer", "social"]
    },
    //筛选类型
    filterType: {
      type: String,
      enum: ["scale", "user", "frequency"]
    },
    //频率筛选条件
    filterScore: { type: Number },
    //筛选层级
    layer: { type: Number },
    //是否领导
    filterRange: {
      type: String,
      enum: ["leader", "staff", "all"]
    },
    //创建者id
    creatorId: { type: String, required: true },
    //创建者姓名
    creatorName: { type: String, required: true },
    //量表id
    scaleId: { type: ObjectId },
    //量表名称
    name: { type: String, required: true },
    //引导语
    guide: { type: String },
    //描述
    description: { type: String, required: true },
    //问题
    question: [
      {
        content: String,
        scoreMethod: { type: String, enum: ["forward", "afterward"] }
      }
    ],
    //标尺
    option: [{ content: String }],
    //分数
    score: [{ score: Number }],
    //反馈
    feedback: [
      {
        upper: Number,
        lower: Number,
        recommend: String,
        evaluation: String
      }
    ],
    //社会网络筛选指标：DegCent,IDegCent,ODegCent,EgCent,CloCent,BetCent,KBetCent,
    //AveNeiDeg,PagLink,Dens,Cenrliza,CenrlizaIn,CenrlizaOut
    socialFeedback: [{ type: SocialFeedbackSchema }],
    //反馈类型
    feedbackType: {
      type: String,
      enum: ["score", "rate"]
    },
    //生成反馈百分比
    rateToFeedback: { type: Number, min: 0, max: 100 },
    //公开或者私有,默认私有
    isPublic: { type: Boolean, default: false },
    //归档
    isArchive: { type: Boolean, default: false },
    //标签
    tag: [{ type: String, required: true }],
    //量表来源
    source: { type: String },
    //备注
    note: { type: String },
    //版本全名
    version: { type: Number, default: 0 },
    //是否删除
    isDelete: { type: Boolean, default: false },
    //是否最新版本
    isNewest: { type: Boolean, default: true },
    //上一版本id
    preVersionId: { type: ObjectId },
    //引用次数
    referenceNum: { type: Number, default: 0 },
    //版本更新信息
    changeLog: { type: String },
    //语言
    language: {
      type: String,
      enum: ["zh", "en-US"]
    }
  },
  { collection: 'scale', versionKey: false, timestamps: true },
);

ScaleSchema.pre("save", function (this: IScale, next) {
  if (!this.scaleId) {
    this.scaleId = this._id;
  }
  if (this.feedback) {
    this.feedback = _.sortBy(this.feedback, "lower");
  }
  next();
});