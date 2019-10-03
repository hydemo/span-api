import { Body, Controller, Get, Post, Query, Inject, Request, Param, UseGuards } from '@nestjs/common';
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectService } from 'src/module/project/project.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { CompanyProjectService } from 'src/module/companyProject/companyProject.service';
import { AuthGuard } from '@nestjs/passport';


@ApiUseTags('company/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/projects')
@UseGuards(AuthGuard())
export class CompanyProjectController {
  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
    @Inject(CompanyProjectService) private companyProjectService: CompanyProjectService,
  ) { }

  @Get('')
  @ApiOperation({ title: '获取计划列表', description: '获取计划列表' })
  async projects(
    @Query() pagination: Pagination
  ) {
    const data = await this.projectService.projectsForCompany(pagination)
    return { status: 200, data }
  }

  @Post(':id')
  @ApiOperation({ title: '获取计划列表', description: '获取计划列表' })
  async acceptProject(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
    @Body() questionnaires: any
  ) {
    return await this.companyProjectService.acceptProject(id, req.user, questionnaires)
  }


}