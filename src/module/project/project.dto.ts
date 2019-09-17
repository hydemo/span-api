import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '计划名称' })
  readonly name: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '描述' })
  readonly description: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '描述' })
  readonly coverImages: string;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否是周期' })
  readonly periodicity: boolean;

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '费用' })
  readonly fee: number;

  @ApiModelProperty({ description: '周期信息' })
  readonly periodicityInfo: {
    //周期方法: days,months,weeks,
    timeMethod: string,
    //间隔 
    interval: number,
    //作答时间限制 :{startTime：HH:mm:ss, lowTime:HH:mm:ss } 限制小于周期
    limit: {
      startTime: string,
      time: number,
    },
    //次数
    frequency: number,
  };

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '当前周期数' })
  readonly sequence: number;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '归档' })
  readonly isArchive: boolean;

  @IsArray()
  @ApiModelProperty({ description: '问卷列表' })
  readonly questionnaires:
    {
      // 问卷Id
      questionnaireId: string,
      // 问卷名称
      questionnaireName: string,
      //初始层级
      initLayer: number,
      // 分配范围
      ranges: any[],
      // 分配范围key
      rangesKey: any[],
      // 评价对象
      rateeType: number,
    }[];

}
