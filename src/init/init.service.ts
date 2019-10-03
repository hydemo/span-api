import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as md5 from 'md5';
import axios from 'axios';
import { CreateAdminDTO } from 'src/module/admin/admin.dto';
import { AdminService } from 'src/module/admin/admin.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class InitService {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  async init() {
    console.log(md5('1234567'))
    const adminExist = await this.adminService.countByCondition({})
    if (!adminExist) {
      const admin: CreateAdminDTO = {
        username: 'span',
        password: md5('admin'),
        email: 'ouyangxujing@thinkthen.cn',
        phone: '13799746707'
      }
      await this.adminService.create(admin)

    }
  }

}