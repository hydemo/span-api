import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from 'src/common/dto/pagination.dto';
import { OrganizationService } from 'src/module/organization/organization.service';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';


@ApiUseTags('admin/users')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('admin')
@UseGuards(AuthGuard())
export class CMSOrganizationController {
  constructor(
    @Inject(OrganizationService) private organizationService: OrganizationService,
  ) { }

  @ApiOkResponse({
    description: '企业列表',
    // // type: CreateOrganizationDTO,
    isArray: true,
  })
  @Get('/companys')
  @ApiOperation({ title: '企业列表', description: '企业列表' })
  async companys(@Query() pagination: Pagination) {
    const data = await this.organizationService.findAll(pagination);
    return { status: 200, data }
  }

  @ApiOkResponse({
    description: '删除企业',
    // // type: CreateOrganizationDTO,
    isArray: true,
  })
  @Delete('/companys/:id')
  @ApiOperation({ title: '删除企业', description: '删除企业' })
  async deleteCompany(
    @Param('id', new MongodIdPipe) id: string
  ) {
    return await this.organizationService.deleteCompany(id);
  }

  @Post('/organizations/company')
  @ApiOperation({ title: '新增企业', description: '新增企业' })
  async addCompany(
    @Body('name') name: string,
    @Request() req: any
  ) {
    await this.organizationService.create(name, req.user);
    return { status: 200, code: 2020 };
  }

}