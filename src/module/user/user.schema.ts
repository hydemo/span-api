import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const UserSchema = new mongoose.Schema(
  {
    //企业id
    companyId: { type: String, trim: true },
    //企业名称
    companyName: { type: String, trim: true },
    //LayerID
    layerId: { type: ObjectId },
    //层级
    layer: { type: Number },
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
    //用户名
    username: { type: String },
    //密码
    password: { type: String },
    //邮箱
    email: { type: String },
    //手机号
    phone: { type: String, trim: true },
    //是否领导
    isLeader: { type: Boolean },
    //是否激活
    isActive: { type: Boolean, default: false },
    //头像
    avatar: { type: String },
    //token
    accessToken: { type: String },
    //用户信息
    userinfo: {
      //姓
      surname: String,
      //名
      firstname: String,
      //姓名
      fullname: String,
      //别名
      preferredName: String,
      //最高学历
      highestDegree: String,
      //毕业院校
      institute: String,
      //毕业时间
      GradYear: Date,
      //性别
      gender: { type: String, },
      //民族
      ethnicGroup: String,
      //婚姻状态
      maritalStatus: String,
      //出生日期
      BirthDate: Date,
      //入职时间
      hireDate: Date,
      //岗位名称
      jobTitle: String,
      //职位
      jobPosition: String,
      //工作地点
      jobLocation: String,
      //聘任状态
      employmentStatus: String,
    },
    //是否删除
    isDelete: { type: Boolean, default: false },
    //删除原因
    deleteReason: { type: String, trim: true },
  },
  { collection: 'user', versionKey: false, timestamps: true },
);
