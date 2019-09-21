import { Model } from 'mongoose'
import * as _ from "lodash";
import { Injectable, Inject } from "@nestjs/common";
import { IUser } from "./user.interfaces";
import { Validator } from "class-validator";
const validator = new Validator();
@Injectable()
export class CheckService {
  constructor(
    @Inject('UserModelToken') private readonly userModel: Model<IUser>,
  ) { }
  userFormateCheck(users, language) {
    const emailDuplicate: any[] = [];
    const phoneDuplicate: any[] = [];
    const uniqueEmail: any[] = [];
    const uniquePhone: any[] = [];
    const emailNoExist: any[] = [];
    const firstnameNoExist: any[] = [];
    const surnameNoExist: any[] = [];
    const fullnameExist: any[] = [];
    const emailFormatError: any[] = [];
    const phoneFormatError: any[] = [];
    users.map((user, index) => {

      if (language === 'zh') {
        if (!user.fullname) {
          fullnameExist.push(index + 2);
        }
      } else {
        if (!user.firstname) {
          firstnameNoExist.push(index + 2);
        }
        if (!user.surname) {
          surnameNoExist.push(index + 2);
        }

      }
      //校验邮箱格式
      if (!user.email) {
        emailNoExist.push(index + 2)
      } else if (!validator.isEmail(user.email))
        emailFormatError.push(index + 2);
      //校验手机格式
      if (user.phone && !validator.isMobilePhone(user.phone, 'zh-CN'))
        phoneFormatError.push(index + 2);
      // //校验id是否重复
      // if (_.intersectionBy(uniqueId, Array(user), 'username').length !== 0) {
      //   userIdDuplicate.push(user.user_id)
      // } else {
      //   uniqueId.push(user)
      // }
      ////校验邮箱是否重复
      if (_.intersectionBy(uniqueEmail, Array(user), 'email').length !== 0) {
        emailDuplicate.push(index + 2)
      } else {
        uniqueEmail.push(user)
      }
      ////校验手机是否重复
      if (user.phone) {
        if (_.intersectionBy(uniquePhone, Array(user), 'phone').length !== 0) {
          phoneDuplicate.push(index + 2)
        } else {
          uniquePhone.push(user)
        }
      }
    });
    // if (userIdDuplicate.length > 0)
    //   return { status: 400, code: 4030, userIdDuplicate};
    //email重复
    if (emailDuplicate.length > 0)
      return { status: 400, code: 4257, errorArray: emailDuplicate };
    //phone重复
    if (phoneDuplicate.length > 0)
      return { status: 400, code: 4258, errorArray: phoneDuplicate };
    //email格式错误
    if (emailFormatError.length > 0)
      return { status: 400, code: 4019, errorArray: emailFormatError };
    //phone格式错误
    if (phoneFormatError.length > 0)
      return { status: 400, code: 4053, errorArray: phoneFormatError };
    if (emailNoExist.length > 0)
      return { status: 400, code: 4009, errorArray: emailNoExist };
    if (firstnameNoExist.length > 0)
      return { status: 400, code: 4250, errorArray: firstnameNoExist };
    if (surnameNoExist.length > 0)
      return { status: 400, code: 4249, errorArray: surnameNoExist };
    if (fullnameExist.length > 0)
      return { status: 400, code: 4237, errorArray: fullnameExist };
    return
  }

  async userExistCheck(users, companyId) {
    const emailExists: any[] = [];
    const phoneExists: any[] = [];
    await Promise.all(
      users.map(async (user, index) => {
        const emailExist = await this.userModel.find({
          email: user.email.toLowerCase(),
          companyId: { $ne: companyId },
        });
        if (emailExist.length) {
          emailExists.push(index + 2)
        }
        if (user.phone) {
          const phoneExist = await this.userModel.find({
            phone: user.phone,
            companyId: { $ne: companyId },
          });
          if (phoneExist.length) {
            phoneExists.push(index + 2)
          }
        }
      })
    )
    if (emailExists.length)
      return { status: 400, code: 4031, errorArray: _.uniq(emailExists) };
    if (phoneExists.length)
      return { status: 400, code: 4032, errorArray: _.uniq(phoneExists) };
    return;
  }

  isLeadCheck(users, length) {
    let isLeadNoExist: any[] = []
    users.map((user, index) => {
      for (let i = 1; i <= length; i++) {
        if (user[`department_layer_${i}`] && !user[`isLeader_layer_${i}`]) {
          isLeadNoExist.push(index + 2)
          break;
        }
      }
    })
    if (isLeadNoExist.length) {
      return { status: 400, code: 4264, errorArray: isLeadNoExist };
    }
    return
  }
}