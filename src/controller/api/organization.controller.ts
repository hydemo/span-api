import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, UseInterceptors, FileInterceptor, UploadedFile, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiConsumes,
  ApiImplicitFile,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { UserService } from 'src/module/user/user.service';
import { OrganizationService } from 'src/module/organization/organization.service';


@ApiUseTags('api/organization')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('api/organization')
@UseGuards(AuthGuard())
export class ApiOrganizationController {
  constructor(
    @Inject(OrganizationService) private organizationService: OrganizationService,
    @Inject(UserService) private userService: UserService,
  ) { }

  @Get('/')
  @ApiOperation({ title: '获取公司第一级', description: '获取公司第一级' })
  async organizations(
    @Request() req: any,
  ) {
    const data = await this.organizationService.getByCompany(req.user.companyId)
    return { status: 200, data }
  }

  @Get('/:id')
  @ApiOperation({ title: '获取部门', description: '获取部门' })
  async organization(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.organizationService.getByCompany(id)
    return { status: 200, data }
  }

  @Get('/:id/children')
  @ApiOperation({ title: '获取子部门', description: '获取子部门' })
  async children(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.organizationService.getChildrenByCompany(id)
    return { status: 200, data }
  }

  @Get('/:id/users')
  @ApiOperation({ title: '获取部门员工', description: '获取部门员工' })
  async users(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
    @Query('isLeader') isLeader: string
  ) {
    const condition: any = { layerId: id, isDelete: false }
    if (isLeader === 'leader') {
      condition.isLeader = true
    }
    if (isLeader === 'staff') {
      condition.isLeader = false
    }
    console.log(condition, 'dds')
    const data = await this.userService.findByCondition(condition)
    return { status: 200, data }
  }
}