import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IScaleOption } from './scaleOption.interfaces';
import { CreateScaleOptionDTO } from './scaleOption.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { IAdmin } from '../admin/admin.interfaces';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';

@Injectable()
export class ScaleOptionService {
  constructor(
    @Inject('ScaleOptionModelToken') private readonly scaleOptionModel: Model<IScaleOption>,

  ) { }

  // 创建数据
  async create(scaleOption: CreateScaleOptionDTO, user: IAdmin) {
    const createScaleOption: CreateScaleOptionDTO = { ...scaleOption, creatorId: user._id, creatorName: user.username }
    return await this.scaleOptionModel.create(createScaleOption)
  }

  // 标尺增量
  async incReference(id: string, inc: number) {
    return await this.scaleOptionModel.findByIdAndUpdate(id, { $inc: { referenceNum: inc } })
  }

  // 删除标尺库
  async deleteById(id: string, userId: string) {
    const scaleOption = await this.scaleOptionModel.findById(id)
    if (!scaleOption) {
      return
    }
    if (String(userId) !== String(scaleOption.creatorId)) {
      throw new ApiException('无权限操作', ApiErrorCode.NO_PERMISSION, 403);
    }
    await this.scaleOptionModel.findByIdAndDelete(id);
    return;
  }

  // 查询全部数据
  async list(pagination: Pagination, type: string, userId: string) {
    const search = [
      { name: new RegExp(pagination.value || '', "i") },
      { "option.content": new RegExp(pagination.value || '', "i") }
    ];
    let condition;
    if (type === "public") {
      condition = {
        isPublic: true,
        $or: search,
        creatorId: { $ne: userId }
      };
    } else {
      condition = {
        creatorId: userId,
        $or: search
      };
    }
    const data = await this.scaleOptionModel.find(condition)
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ status: 1, updatedAt: -1 })
      .exec();
    const total = await this.scaleOptionModel.countDocuments(condition);
    return { status: 200, data: data, total };
  }

}