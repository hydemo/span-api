import { Body, Controller, Get, Post, Query, Inject, Request } from '@nestjs/common';
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectService } from 'src/module/project/project.service';
import { Pagination } from 'src/common/dto/pagination.dto';


@ApiUseTags('company/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/projects')
// @UseGuards(AuthGuard())
export class CompanyProjectController {
  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
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
    @Body() project: any,
    @Request() req: any,
  ) {
    // const data = await this.projectService.acceptProject(id, req.user)
    return { status: 200 }
  }


}