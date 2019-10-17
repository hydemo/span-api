import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';


@ApiUseTags('api/user')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('api')
export class ApiKefusController {
  constructor(

  ) { }

  @Post('/weixin')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async login(
    @Body() body,
    @Query('openid') openid: string,
    @Request() req: any
  ) {
    console.log(body)
    return {
      MsgType: 'transfer_customer_service',
      ToUserName: openid,
      FromUserName: 'x314110712',
      CreateTime: parseInt(String(Date.now() / 1000)),
    }
  }

  @Get('/weixin')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async weixin(
    @Query('echostr') echostr: string,
    @Request() req: any
  ) {
    return echostr
  }



}