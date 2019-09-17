import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScaleDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '名称' })
  readonly name: string;

  @IsNumber()
  @Type(() => String)
  @ApiModelProperty({ description: '层级' })
  readonly layer: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '层级名称' })
  readonly layerName: string;

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '层级名称' })
  readonly producerId: string;
}
