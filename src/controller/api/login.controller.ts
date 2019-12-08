import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/module/user/user.service';
import { CreateUserDTO, LoginDTO, ResetPassDTO, EmailPassDTO, UpdateDTO, ResetMyPassDTO } from 'src/module/user/user.dto';


@ApiUseTags('api/user')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('api/user')
export class ApiUserController {
  constructor(
    @Inject(UserService) private userService: UserService,
  ) { }

  @Post('/login')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async login(
    @Body() login: LoginDTO,
    @Request() req: any
  ) {
    const clientIp = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    return await this.userService.login(login.username, login.password, clientIp);
  }

  @Put('/update')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async update(
    @Body() update: UpdateDTO,
    @Request() req: any
  ) {
    return await this.userService.updateById(req.user._id, update);
  }

  @Put('/password')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async resetMyPassword(
    @Body() reset: ResetMyPassDTO,
    @Request() req: any
  ) {
    return await this.userService.resetMyPassword(req.user, reset);
  }

  @UseGuards(AuthGuard())
  @Get('/signout')
  @ApiOkResponse({
    description: '登录成功',
  })
  @ApiOperation({ title: '登录', description: '登录' })
  async signout(
    @Request() req): Promise<any> {
    await this.userService.signout(req.user._id)
    return { status: 200, code: 2002 }
  }

  @Post('/email/password')
  @ApiOkResponse({
    description: '邮箱重置密码',
  })
  @ApiOperation({ title: '邮箱重置密码', description: '邮箱重置密码' })
  async sendResetPassEmail(
    @Body() reset: EmailPassDTO,
    @Request() req): Promise<any> {
    return await this.userService.sendResetPassEmail(reset.username, reset.language)
  }

  @Post('/phone/activation')
  @ApiOkResponse({
    description: '发送短信验证码',
  })
  @ApiOperation({ title: '发送短信验证码', description: '发送短信验证码' })
  async sendPhoneCode(
    @Body('username') username: string,
    @Request() req): Promise<any> {
    return await this.userService.sendPhoneCode(username)
  }

  @Post('/phone/codeverification')
  @ApiOkResponse({
    description: '短信验证码校验',
  })
  @ApiOperation({ title: '短信验证码校验', description: '短信验证码校验' })
  async phoneCodeCheck(
    @Body('code') code: string,
    @Body('username') username: string,
    @Request() req): Promise<any> {
    return await this.userService.phoneCodeCheck(username, code)
  }

  @Put('/passforget')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async passforget(
    @Body() reset: ResetPassDTO,
  ): Promise<any> {
    return await this.userService.resetPassword(reset.username, reset)
  }

  @Get('/passforget')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async forgetTokenCheck(
    @Query('token') token: string,
    @Response() res,
  ): Promise<any> {
    return await this.userService.forgetTokenCheck(token, res)
  }

}