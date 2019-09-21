import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDTO {
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
    layerId: string;
    //层级
    layer: number,
    //组织名称
    layerName: string;
    //父节点id
    parentId: string;
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
    surname: string;
    //名
    firstname: string;
    //姓名
    fullname: string;
    //别名
    preferredName: string;
    //最高学历
    highestDegree: string;
    //毕业院校
    institute: string;
    //毕业时间
    GradYear: Date;
    //性别
    gender: { type: string; },
    //民族
    ethnicGroup: string;
    //婚姻状态
    maritalStatus: string;
    //出生日期
    BirthDate: Date;
    //入职时间
    hireDate: Date;
    //岗位名称
    jobTitle: string;
    //职位
    jobPosition: string;
    //工作地点
    jobLocation: string;
    //聘任状态
    employmentStatus: string;
  };
  //是否删除
  readonly isDelete: boolean;
  //删除原因
  readonly deleteReason: string;
}

export class PhoneREDTO {
  @IsString()
  @IsEnum(['active', 'forget'])
  @Type(() => String)
  @ApiModelProperty({ description: '类型' })
  readonly language: string;
}

export class CreateEmployeeDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly fullname: string;

  @IsEmail()
  @Type(() => String)
  @ApiModelProperty({ description: '邮箱' })
  readonly email: string;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否领导' })
  readonly isLeader;

  @IsMobilePhone('zh-CN')
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '手机号' })
  readonly phone?: string;
}

export class ResetPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '新密码' })
  readonly password: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '确认密码' })
  readonly confirm: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: 'token' })
  readonly token: string;
}

export class EmailPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @IsEnum(['zh', 'en-US'])
  @Type(() => String)
  @ApiModelProperty({ description: '语言' })
  readonly language: string;
}

export class LoginDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}