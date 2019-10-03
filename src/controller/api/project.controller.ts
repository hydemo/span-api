import { Controller, Get, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UserProjectService } from 'src/module/userProject/userProject.service';


@ApiUseTags('api/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('api/projects')
@UseGuards(AuthGuard())
export class CMSProjectController {
  constructor(
    @Inject(UserProjectService) private userProjectService: UserProjectService,
  ) { }

  @ApiOkResponse({
    description: '问卷计划列表',
    isArray: true,
  })
  @Get('/')
  @ApiOperation({ title: '问卷计划列表', description: '问卷计划列表' })
  async sacles(
    @Request() req: any,
  ) {
    const data = await this.userProjectService.list(req.user._id)
    return { status: 200, data }
  }
}