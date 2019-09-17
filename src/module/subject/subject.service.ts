import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { ISubject } from './subject.interfaces';
import { CreateSubjectDTO } from './subject.dto';
import { Pagination } from 'src/common/dto/pagination.dto';

@Injectable()
export class SubjectService {
  constructor(
    @Inject('SubjectModelToken') private readonly subjectModel: Model<ISubject>,

  ) { }

  // 创建数据
  async create(subject: any): Promise<ISubject> {
    return await this.subjectModel.create(subject)
  }
  // 删除数据
  async deleteById(id: string) {
    return await this.subjectModel.findByIdAndDelete(id)
  }
}