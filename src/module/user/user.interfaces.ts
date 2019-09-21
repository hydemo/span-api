import { Document } from 'mongoose';

export interface IUser extends Document {
  //企业id
  readonly companyId: string;
  //企业名称
  readonly companyName: string;
  //LayerID
  readonly layerId: string;
  //层级
  readonly layer: number;
  //层级线
  readonly layerLine: [{
    //层级id
    layerId: string,
    //层级
    layer: number,
    //组织名称
    layerName: string,
    //父节点id
    parentId: string,
  }];
  //用户名
  readonly username: string;
  //密码
  readonly password: string;
  //邮箱
  readonly email: string;
  //手机号
  readonly phone: string;
  //是否领导
  readonly isLeader: boolean;
  //是否激活
  readonly isActive: boolean;
  //头像
  readonly avatar: string;
  //用户信息
  readonly userinfo: {
    //姓
    surname: string,
    //名
    firstname: string,
    //姓名
    fullname: string,
    //别名
    preferredName: string,
    //最高学历
    highestDegree: string,
    //毕业院校
    institute: string,
    //毕业时间
    GradYear: Date,
    //性别
    gender: string,
    //民族
    ethnicGroup: string,
    //婚姻状态
    maritalStatus: string,
    //出生日期
    BirthDate: Date,
    //入职时间
    hireDate: Date,
    //岗位名称
    jobTitle: string,
    //职位
    jobPosition: string,
    //工作地点
    jobLocation: string,
    //聘任状态
    employmentStatus: string,
  };
  //是否删除
  readonly isDelete: boolean;
  //删除原因
  readonly deleteReason: string;
}

export interface ITitle {
  '姓名': 'fullname',
  '电子邮箱': 'email',
  '手机': 'phone',
  '密码': 'password',
  '别名': 'preferredName',
  '最高学历': 'highestDegree',
  '毕业院校': 'institute',
  '性别': 'gender',
  '毕业时间': 'GradYear',
  '民族': 'ethnicGroup',
  '婚姻状态': 'maritalStatus',
  '出生日期': 'BirthDate',
  '入职日': 'hireDate',
  '岗位名称': 'jobTitle',
  '职位': 'jobPosition',
  '工作地点': 'jobLocation',
  '聘任状态': 'employmentStatus',
  'surname': 'surname',
  'firstname': 'firstname',
  'email': 'email',
  'cell': 'phone',
  'password': 'password',
  'preferredname': 'preferredName',
  'highestdegree': 'highestDegree',
  'institute': 'institute',
  'gender': 'gender',
  'grad.year': 'GradYear',
  'ethnicgroup': 'ethnicGroup',
  'maritalstatus': 'maritalStatus',
  'birthdate': 'BirthDate',
  'hiredate': 'hireDate',
  'jobtitle': 'jobTitle',
  'jobposition': 'jobPosition',
  'joblocation': 'jobLocation',
  'employmentstatus': 'employmentStatus',
} 