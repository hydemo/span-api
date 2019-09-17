import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserinfoDTO } from '../userinfo/userinfo.dto';
import { CreateSubjectDTO } from '../subject/subject.dto';
import { CreateUserfilterDTO } from '../userfilter/userfilter.dto';

export class QuestionnaireDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '问卷名称' })
  readonly name: string;

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '问卷类型(0:自评,1:筛选互评,2:互评,3:社会网络,4:筛选社会网络)' })
  readonly category: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '问卷引导语' })
  readonly guide: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '描述' })
  readonly description: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '语言' })
  readonly language: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '备注' })
  readonly note: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '是否公开默认私有' })
  readonly isPublic: boolean;
}

export class CreateQuestionnaireDTO {
  readonly questionnaires: any;

  readonly userinfos?: any[];
  readonly userfilters?: any[];
  readonly subjects: any[];
}
