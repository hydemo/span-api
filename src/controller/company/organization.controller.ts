import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, UseInterceptors, FileInterceptor, UploadedFile, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiConsumes,
  ApiImplicitFile,
} from '@nestjs/swagger';
import * as multer from 'multer'
import { join } from 'path';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from 'src/module/company/company.service';
import { CreateCompanyDTO, CompanyLoginDTO, CompanyResetPassDTO, CompanyEmailPassDTO } from 'src/module/company/company.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { UserService } from 'src/module/user/user.service';
import { OrganizationService } from 'src/module/organization/organization.service';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';


@ApiUseTags('company/organization')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/organization')
@UseGuards(AuthGuard())
export class CompanyOrganizationController {
  constructor(
    @Inject(OrganizationService) private organizationService: OrganizationService,
    @Inject(UserService) private userService: UserService,
  ) { }

  @Get('')
  @ApiOperation({ title: '获取公司第一级', description: '获取公司第一级' })
  async organization(
    @Request() req: any,
  ) {
    const data = await this.organizationService.getByCompany(req.user.companyId)
    return { status: 200, data }
  }

  @Get('/:id/children')
  @ApiOperation({ title: '获取公司第一级', description: '获取公司第一级' })
  async children(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.organizationService.getChildrenByCompany(id)
    return { status: 200, data }
  }

  @Post('/:id/children')
  @ApiOperation({ title: '新增子节点', description: '新增子节点' })
  async addChildren(
    @Body('name') name: string,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    return await this.organizationService.addChildren(id, name)
  }

  @Put('/:id')
  @ApiOperation({ title: '节点重命名', description: '节点重命名' })
  async rename(
    @Body('name') name: string,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    return await this.organizationService.rename(id, name)
  }

  @Delete('/:id')
  @ApiOperation({ title: '删除节点', description: '删除节点' })
  async deleteNode(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const userCount = await this.userService.count({
      isDelete: false,
      'layerLine.layerId': id,
    })
    if (userCount) {
      throw new ApiException('部门下有员工，无法删除', ApiErrorCode.NO_PERMISSION, 403)
    }
    return await this.organizationService.deleteNode(id)
  }
}