import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from 'src/module/admin/admin.service';
import { LoginDTO, ResetPassDTO, PhoneDTO, EmailPassDTO } from 'src/module/admin/admin.dto';


@ApiUseTags('admin/users')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@Controller('admin')
export class CMSAdminController {
  constructor(
    @Inject(AdminService) private adminService: AdminService,
  ) { }
  @Post('/login')
  @ApiOkResponse({
    description: '登录成功',
  })
  @ApiOperation({ title: '登录', description: '登录' })
  async login(
    @Body() login: LoginDTO,
    @Request() req, ): Promise<any> {
    const clientIp = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    return await this.adminService.login(login.username, login.password, clientIp);
  }

  @UseGuards(AuthGuard())
  @Get('/signout')
  @ApiOkResponse({
    description: '登录成功',
  })
  @ApiOperation({ title: '登录', description: '登录' })
  async signout(
    @Request() req): Promise<any> {
    await this.adminService.signout(req.user._id)
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
    return await this.adminService.sendResetPassEmail(reset.username, reset.language)
  }

  @Post('/phone/activation')
  @ApiOkResponse({
    description: '发送短信验证码',
  })
  @ApiOperation({ title: '发送短信验证码', description: '发送短信验证码' })
  async sendPhoneCode(
    @Body('username') username: string,
    @Request() req): Promise<any> {
    return await this.adminService.sendPhoneCode(username)
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
    return await this.adminService.phoneCodeCheck(username, code)
  }

  @Put('/passforget')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async passforget(
    @Body() reset: ResetPassDTO,
  ): Promise<any> {
    return await this.adminService.resetPassword(reset.username, reset)
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
    return await this.adminService.forgetTokenCheck(token, res)
  }
}