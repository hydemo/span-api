import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { IScale } from './sacle.interfaces';
import { ScalePagination } from './pagination.dto';
import { TagService } from '../scaleTag/scaleTag.service';
import { ScaleOptionService } from '../scaleOption/scaleOption.service';
import { ScaleValidator } from './scale.validator';

@Injectable()
export class ScaleService {
  constructor(
    @Inject('ScaleModelToken') private readonly scaleModel: Model<IScale>,
    @Inject(TagService) private readonly tagService: TagService,
    @Inject(ScaleValidator) private readonly scaleValidator: ScaleValidator,
    @Inject(ScaleOptionService) private readonly scaleOptionService: ScaleOptionService,
  ) { }

  // 创建数据
  async create(scale: any) {
    const checkResult = await this.scaleValidator.scaleCheck(scale)
    if (checkResult.status !== 200) {
      return checkResult
    }
    const tags = scale.tag;
    for (let tag of tags) {
      const tagExist = await this.tagService.getTag(tag);
      if (!tagExist) {
        await this.tagService.create(tag);
      }
    }
    //统计量表标尺方案被使用次数
    if (scale.scaleOptionId) {
      await this.scaleOptionService.incReference(scale.scaleOptionId, 1)
    }
    await this.scaleModel.create(scale);
    return { status: 200, code: 2041 };
  }

  // 创建数据
  async update(id, scale: any) {
    if (!scale.changeLog) {
      return { status: 400, code: 4234 };
    }
    const preScale: IScale | null = await this.scaleModel.findById(id);
    if (!preScale) {
      throw new ApiException('无权限操作', ApiErrorCode.NO_PERMISSION, 403);
    }
    const version = preScale.version + 1;
    const scaleId = preScale.scaleId;
    preScale.isNewest = false;
    await preScale.save();
    const tags = scale.tag;
    for (let tag of tags) {
      const tagExist = await this.tagService.getTag(tag);
      if (!tagExist) {
        await this.tagService.create(tag);
      }
    }
    if (scale.scaleOptionId) {
      await this.scaleOptionService.incReference(scale.scaleOptionId, 1)
    }
    const newScale = { ...scale, version, scaleId, preVersionId: id };
    await this.scaleModel.create(newScale);

    return { status: 200, code: 2043 };
  }

  // 根据id获取详情
  async findById(id: string) {
    const scale = await this.scaleModel.findById(id)
    if (!scale) {
      throw new ApiException('No Exist', ApiErrorCode.NO_EXIST, 404)
    }
    return scale
  }

  // 根据id获取详情
  async find(condition: any): Promise<IScale[]> {
    return await this.scaleModel.find(condition)

  }


  // 根据id删除
  async deleteById(id: string) {
    const scale = await this.scaleModel.findById(id)
    if (!scale) {
      return
    }
    if (scale.referenceNum > 0) {
      throw new ApiException('无权限操作', ApiErrorCode.NO_PERMISSION, 403);
    }
    if (scale.preVersionId) {
      await this.scaleModel.findByIdAndUpdate(scale.preVersionId, { isNewest: true });
    }
    return await this.scaleModel.findByIdAndDelete(id)
  }

  // 归档
  async archive(scaleId: string) {
    return await this.scaleModel.updateMany({ scaleId }, { isArchive: true })
  }

  // 复原
  async recover(scaleId: string) {
    return await this.scaleModel.updateMany({ scaleId }, { isArchive: false })
  }

  // 查询全部数据
  async list(pagination: ScalePagination, creatorId: string) {
    let condition: any = {};
    condition.isDelete = false
    switch (pagination.type) {
      case 'private':
        condition = {
          creatorId,
          tag: new RegExp(pagination.value || '', "i"),
          isNewest: true,
          scaleType: pagination.scaleType,
        };
        break;
      case 'public':
        condition = {
          creatorId: { $ne: creatorId },
          tag: new RegExp(pagination.value || '', "i"),
          isNewest: true,
          isPublic: true,
          scaleType: pagination.scaleType
        };
        break;
      case 'version':
        {
          if (!pagination.scaleId) {
            throw new ApiException('无权限操作', ApiErrorCode.NO_PERMISSION, 403);
          }
          condition = {
            scaleId: pagination.scaleId
          };
        }
        break;
      default: {
        condition = {
          $or: [
            {
              creatorId,
              tag: new RegExp(pagination.value || '', "i"),
              isNewest: true,
              scaleType: pagination.scaleType
            },
            {
              creatorId: { $ne: creatorId },
              tag: new RegExp(pagination.value || '', "i"),
              isNewest: true,
              isPublic: true,
              scaleType: pagination.scaleType
            }
          ]
        }
      }
        break;
    }

    if (pagination.subjectType) {
      condition.subjectType = pagination.subjectType
    };

    if (pagination.isArchive) {
      condition.isArchive = pagination.isArchive;
    } else {
      condition.isArchive = false;
    }

    const scales = await this.scaleModel.find(condition)
      .sort({ createdAt: -1 })
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .lean()
      .exec();
    const total = await this.scaleModel.countDocuments(condition);
    return { scales, total };
  }

  // 增量
  async incReference(id: string, inc: number) {
    return await this.scaleModel.findByIdAndUpdate(id, { $inc: { referenceNum: inc } })
  }

}