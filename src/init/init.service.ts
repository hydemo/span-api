import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as md5 from 'md5';
import axios from 'axios';
import { CreateAdminDTO } from 'src/module/admin/admin.dto';
import { AdminService } from 'src/module/admin/admin.service';
import { ConfigService } from 'src/config/config.service';
import { UserLinkService } from 'src/module/userLink/userLink.service';

@Injectable()
export class InitService {
  constructor(
    private readonly adminService: AdminService,
    private readonly userLinkService: UserLinkService,
  ) { }

  async init() {
    // const userLinks = await this.userLinkService.findByCondition({})
    // await Promise.all(userLinks.map(async userLink => {
    //   const raterLayer = userLink.raterLayerLine.length
    //   const rateeLayer = userLink.rateeLayerLine.length
    //   await this.userLinkService.findByIdAndUpdate(userLink._id, { raterLayer, rateeLayer })
    // }))
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