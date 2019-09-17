import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

export interface EnvConfig {
  [prop: string]: string;
}

export interface Redis {
  host: string;
  port: number;
  db: number;
  password: string;
  // namespace: 'bbb',
  keyPrefix: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),

      PORT: Joi.number().default(8000),

      NAME: Joi.string(),

      API_URL: Joi.string(),

      CMS_URL: Joi.string(),

      DATABASE_TYPE: Joi.string().default('mongodb'),

      DATABASE_HOST: Joi.string().default('localhost'),

      DATABASE_PORT: Joi.number().default(27017),

      DATABASE_USER: Joi.string().default('root'),

      DATABASE_PWD: Joi.string(),

      DATABASE_DB: Joi.string().required(),

      WEIXIN_APPID: Joi.string().required(),

      WEIXIN_APPSECRET: Joi.string().required(),

      WEIXIN_MCHID: Joi.string().required(),

      WEIXIN_PARTNER_KEY: Joi.string().required(),

      WEIXIN_NOTIFY_URL: Joi.string().required(),

      SPBILL_CREAT_IP: Joi.string().required(),

      QINIU_ACCESSKEY: Joi.string().required(),

      QINIU_SECRETKEY: Joi.string().required(),

      QINIU_BUCKEY: Joi.string().required(),

      MAIL_HOST: Joi.string().required(),

      MAIL_PORT: Joi.number().required(),

      MAIL_SECURE: Joi.boolean().required(),

      MAIL_AUTH_USER: Joi.string().required(),

      MAIL_AUTH_PASS: Joi.string().required(),

      PHONE_ACCESS_KEY: Joi.string().required(),

      PHONE_ACCESS_SECRET: Joi.string().required(),

      PHONE_VERIFY_MODEL: Joi.string().required(),

      PHONE_SIGN_MODEL: Joi.string().required(),

      REDIS_HOST: Joi.string().required(),

      REDIS_PORT: Joi.number().default(6379),

      REDIS_DB: Joi.number().default(10),

      REDIS_PASS: Joi.string().required(),

      REDIS_KEYPREFIX: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get env(): string {
    return this.envConfig.NODE_ENV;
  }

  get port(): number {
    return Number(this.envConfig.PORT);
  }

  get name(): string {
    return this.envConfig.NAME;
  }

  get api_url(): string {
    return this.envConfig.API_URL
  }

  get cms_url(): string {
    return this.envConfig.CMS_URL
  }

  get databaseType(): string {
    return this.envConfig.DATABASE_TYPE;
  }

  get databaseUser(): string {
    return this.envConfig.DATABASE_USER;
  }

  get databasePwd(): string {
    return this.envConfig.DATABASE_PWD;
  }

  get databaseHost(): string {
    return this.envConfig.DATABASE_HOST;
  }

  get databasePort(): number {
    return Number(this.envConfig.DATABASE_PORT);
  }

  get databaseName(): string {
    return this.envConfig.DATABASE_DB;
  }

  get appid(): string {
    return this.envConfig.WEIXIN_APPID;
  }

  get secret(): string {
    return this.envConfig.WEIXIN_APPSECRET;
  }

  get pcAppid(): string {
    return this.envConfig.PC_APPID;
  }

  get pcSecret(): string {
    return this.envConfig.PC_APPSECRET;
  }

  get mchId(): string {
    return this.envConfig.WEIXIN_MCHID;
  }

  get partnerKey(): string {
    return this.envConfig.WEIXIN_PARTNER_KEY;
  }

  get notifyUrl(): string {
    return this.envConfig.WEIXIN_NOTIFY_URL;
  }

  get spbillCreatIp(): string {
    return this.envConfig.SPBILL_CREAT_IP
  }

  get qiniuAccessKey(): string {
    return this.envConfig.QINIU_ACCESSKEY
  }

  get qiniuSecretKey(): string {
    return this.envConfig.QINIU_SECRETKEY
  }

  get qiniuBucket(): string {
    return this.envConfig.QINIU_BUCKEY
  }

  get mail_opts(): any {
    return {
      host: this.envConfig.MAIL_HOST,
      port: Number(this.envConfig.MAIL_PORT),
      secure: Boolean(this.envConfig.MAIL_SECURE),
      auth: {
        user: this.envConfig.MAIL_AUTH_USER,
        pass: this.envConfig.MAIL_AUTH_PASS,
      },
    }
  }

  get phoneAccessKey(): string {
    return this.envConfig.PHONE_ACCESS_KEY
  }

  get phoneAccessSecret(): string {
    return this.envConfig.PHONE_ACCESS_SECRET
  }

  get verifyModel(): string {
    return this.envConfig.PHONE_VERIFY_MODEL
  }

  get signModel(): string {
    return this.envConfig.PHONE_SIGN_MODEL
  }

  get redis(): Redis {
    return {
      host: this.envConfig.REDIS_HOST,
      port: Number(this.envConfig.REDIS_PORT),
      db: Number(this.envConfig.REDIS_DB),
      password: this.envConfig.REDIS_PASS,
      keyPrefix: this.envConfig.REDIS_KEYPREFIX,
    }
  }

}