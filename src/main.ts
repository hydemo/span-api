import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ConfigService } from './config/config.service';

import { InitService } from './init/init.service';
// import { ScheduleService } from './schedule/schedule.service';

const bodyParser = require('body-parser');
// require('body-parser-xml')(bodyParser);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const initService: InitService = app.get(InitService);
  // const scheduleService: ScheduleService = app.get(ScheduleService);
  // app.use(bodyParser.xml({
  //   limit: '2MB',   // Reject payload bigger than 1 MB
  //   xmlParseOptions: {
  //     normalize: true,     // Trim whitespace inside text nodes
  //     normalizeTags: true, // Transform tags to lowercase
  //     explicitArray: false // Only put nodes in array if >1
  //   }
  // }));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, skipMissingProperties: true }));
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const uploadedPath = join(__dirname, '../', 'upload');
  app.useStaticAssets(uploadedPath);
  const ApiOptions = new DocumentBuilder()
    .setTitle('问卷API文档')
    .setDescription('问卷API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .setSchemes('http', 'https')
    .build();
  initService.init();
  // scheduleService.enableSchedule()
  const ApiDocument = SwaggerModule.createDocument(app, ApiOptions, {
    include: [
      AppModule,
    ],
  });
  SwaggerModule.setup('swagger', app, ApiDocument);
  //

  await app.listen(config.port);

}
bootstrap();