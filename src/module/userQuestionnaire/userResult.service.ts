import { Model } from 'mongoose'
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as uuid from "uuid/v4";
import * as moment from 'moment';
import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'
import { IUserQuestionnaire } from './userQuestionnaire.interfaces';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { ProjectService } from '../project/project.service';
import { UserScoreService } from '../userScore/userScore.service';
import { UserAnswerService } from '../userAnswer/userAnswer.service';
import { OrganizationScoreService } from '../organizationScore/organizationScore.service';
import { ScaleService } from '../scale/scale.service';
import { UserProjectService } from '../userProject/userProject.service';
import { UserLinkService } from '../userLink/userLink.service';
import { ICompanyProject } from '../companyProject/companyProject.interfaces';
import { IQuestionnaire } from '../questionnaire/questionnaire.interfaces';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';

@Injectable()
export class UserResultService {
  constructor(
    @Inject('UserQuestionnaireModelToken') private readonly userQuestionnaireModel: Model<IUserQuestionnaire>,
    @Inject(QuestionnaireService) private readonly questionnaireService: QuestionnaireService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(OrganizationService) private readonly organizationService: OrganizationService,
    @Inject(ProjectService) private readonly projectService: ProjectService,
    @Inject(UserScoreService) private readonly userScoreService: UserScoreService,
    @Inject(UserAnswerService) private readonly userAnswerService: UserAnswerService,
    @Inject(OrganizationScoreService) private readonly organizationScoreService: OrganizationScoreService,
    @Inject(ScaleService) private readonly scaleService: ScaleService,
    @Inject(UserProjectService) private readonly userProjectService: UserProjectService,
    @Inject(UserLinkService) private readonly userLinkService: UserLinkService,
  ) { }

  //数据下载
  async download(companyProject: ICompanyProject, questionnaireId: string) {
    const path = "temp/download/excel/";

    const questionnaire: IQuestionnaire | null = await this.questionnaireService.getFullQuestionnaireById(questionnaireId);
    if (!questionnaire) {
      throw new ApiException('问卷不存在', ApiErrorCode.NO_EXIST, 404)
    }
    const userQuestionnaires = await this.userQuestionnaireModel
      .find({
        companyProject: companyProject._id,
        questionnaire: questionnaireId,
      })
      .populate({ path: 'user', model: 'user' })
      .lean()
      .exec();
    const { category } = questionnaire;
    const userinfoSheet: any = {};
    const userfilterSheet: any = [];
    const subjectSheet: any = {};
    const socialSheets: any = [];
    const userinfoCol: any = [];
    const userfilterCol: any = [];
    const subjectCol: any = [];
    const socialCol: any = [];
    const SheetNames: any = [];
    const Sheets: any = {};
    const scoreStr = "分数";
    const query = {
      companyProject: companyProject._id,
      questionnaire: questionnaireId,
    };
    let socialSheetName;
    if (category === 3 || category === 4) {
      for (let i = 0; i < questionnaire.subject.length; i++) {
        socialSheets.push({});
        socialCol.push([]);
        socialSheetName = `社会网络题`;
        SheetNames.push(`社会网络题${i + 1}`);
        socialSheets[i].A1 = { v: "评价人名字" };
        socialCol[i].push({ wch: 12 });
        socialSheets[i].B1 = { v: "评价人邮箱" };
        socialCol[i].push({ wch: 12 });
        socialSheets[i].C1 = { v: "被评价对象" };
        socialCol[i].push({ wch: 14 });
        socialSheets[i].D1 = { v: "被评价对象邮箱" };
        socialCol[i].push({ wch: 14 });
        socialSheets[i].E1 = { v: "开始时间" };
        socialCol[i].push({ wch: 21 });
        socialSheets[i].F1 = { v: "结束时间" };
        socialCol[i].push({ wch: 21 });
        socialSheets[i].G1 = { v: i + 1 };
        socialCol[i].push({ wch: 6 });
      }
      await this.addSocial(query, socialSheets, socialCol);
      for (let i = 0; i < socialSheets.length; i++) {
        const socialKey = Object.keys(socialSheets[i]);
        const socialRef = `${socialKey[0]}:${socialKey[socialKey.length - 1]}`;
        Sheets[`${socialSheetName}${i + 1}`] = Object.assign(
          {},
          socialSheets[i],
          {
            "!ref": socialRef,
            "!cols": socialCol[i]
          }
        );
      }
    } else {
      SheetNames.push("问卷题");
      subjectSheet.A1 = { v: "评价人名字" };
      subjectCol.push({ wch: 12 });
      subjectSheet.B1 = { v: "评价人邮箱" };
      subjectCol.push({ wch: 12 });
      subjectSheet.C1 = { v: "被评价对象" };
      subjectCol.push({ wch: 14 });
      subjectSheet.D1 = { v: "被评价对象邮箱" };
      subjectCol.push({ wch: 14 });
      subjectSheet.E1 = { v: "开始时间" };
      subjectCol.push({ wch: 21 });
      subjectSheet.F1 = { v: "结束时间" };
      subjectCol.push({ wch: 21 });
      let subjectCursor = 0;
      for (let i = 0; i < questionnaire.subject.length; i++) {
        const total = subjectCursor + 6;
        const firstPos = parseInt(String(total / 26))
        const secondPos = total - firstPos * 26
        let pos;
        if (firstPos > 0) {
          pos = `${String.fromCharCode(64 + firstPos)}${String.fromCharCode(
            65 + secondPos
          )}1`;
        } else {
          pos = `${String.fromCharCode(65 + secondPos)}1`;
        }
        const str = `${i + 1}`;
        subjectCol.push({ wch: str.length + 2 });
        subjectSheet[pos] = { v: str };
        subjectCursor++;
        if (questionnaire.subject[i].scaleId) {
          const total = subjectCursor + 6;
          const scoreSecondPos = parseInt(String(total / 26))
          const scoreFirstPos = total - firstPos * 26
          let scorePos;
          if (scoreFirstPos > 0) {
            scorePos = `${String.fromCharCode(
              64 + scoreFirstPos
            )}${String.fromCharCode(65 + scoreSecondPos)}1`;
          } else {
            scorePos = `${String.fromCharCode(65 + scoreSecondPos)}1`;
          }
          subjectCol.push({
            wch: 7
          });
          subjectSheet[scorePos] = {
            v: scoreStr
          };
          subjectCursor++;
        }
      }
      await this.addSubject(query, subjectSheet, subjectCol);
      const subjectKey = Object.keys(subjectSheet);
      const subjectRef = `${subjectKey[0]}:${subjectKey[subjectKey.length - 1]}`;
      Sheets[SheetNames[0]] = Object.assign({}, subjectSheet, {
        "!ref": subjectRef,
        "!cols": subjectCol
      });
    }
    let filterSheetName;
    let filterCursor: any = [];
    if (questionnaire.userfilter.length) {
      for (let i = 0; i < questionnaire.userfilter.length; i++) {
        userfilterSheet.push({});
        userfilterCol.push([]);
        filterCursor.push(2);
        filterSheetName = `筛选题`;
        SheetNames.push(`筛选题${i + 1}`);
        userfilterSheet[i].A1 = { v: "评价人名字" };
        userfilterCol[i].push({ wch: 12 });
        userfilterSheet[i].B1 = { v: "评价人邮箱" };
        userfilterCol[i].push({ wch: 12 });
        userfilterSheet[i].C1 = { v: "被评价对象" };
        userfilterCol[i].push({ wch: 14 });
        userfilterSheet[i].D1 = { v: "被评价对象邮箱" };
        userfilterCol[i].push({ wch: 14 });
        userfilterSheet[i].E1 = { v: "选择" };
        userfilterCol[i].push({ wch: 6 });
      }
    }
    let infoSheetName;
    if (questionnaire.userinfo.length) {

      infoSheetName = "用户信息题";
      SheetNames.push("用户信息题");
      userinfoSheet.A1 = { v: "用户名字" };
      userinfoCol.push({ wch: 10 });
      userinfoSheet.B1 = { v: "邮箱" };
      userinfoCol.push({ wch: 6 });
      for (let i = 0; i < questionnaire.userinfo.length; i++) {
        const total = i + 2;
        const firstPos = parseInt(String(total / 26))
        const secondPos = total - firstPos * 26
        let pos;
        if (firstPos > 0) {
          pos = `${String.fromCharCode(64 + firstPos)}${String.fromCharCode(
            65 + secondPos
          )}1`;
        } else {
          pos = `${String.fromCharCode(65 + secondPos)}1`;
        }
        const str = `${i + 1}`;
        userinfoCol.push({ wch: str.length + 2 });
        userinfoSheet[pos] = { v: str };
      }
    }
    let cursor = 2;
    for (let q of userQuestionnaires) {
      if (q.userinfoChoice.length) {
        cursor = this.addUserinfo(q, cursor, userinfoSheet, userinfoCol);
      }
      if (q.userfilterChoice.length) {
        await this.addUserfilter(
          q,
          filterCursor,
          userfilterSheet,
          userfilterCol
        );
      }
    }
    if (questionnaire.userinfo.length) {
      const userinfoKey = Object.keys(userinfoSheet);
      const userinfoRef = `${userinfoKey[0]}:${userinfoKey[userinfoKey.length - 1]}`;
      Sheets[infoSheetName] = Object.assign({}, userinfoSheet, {
        "!ref": userinfoRef,
        "!cols": userinfoCol
      });
    }
    if (questionnaire.userfilter.length) {
      for (let i = 0; i < questionnaire.userfilter.length; i++) {
        const filterKey = Object.keys(userfilterSheet[i]);
        const filterRef = `${filterKey[0]}:${filterKey[filterKey.length - 1]}`;
        Sheets[`${filterSheetName}${i + 1}`] = Object.assign(
          {},
          userfilterSheet[i],
          {
            "!ref": filterRef,
            "!cols": userfilterCol[i]
          }
        );
      }
    }
    const filename = `${uuid()}.xlsx`;
    const workbook = { SheetNames, Sheets };
    XLSX.writeFile(workbook, `${path}/${filename}`);
    const filePath = `${path}/${filename}`;
    return { path: filePath, filename: filename };
  }

  addUserinfo(userquestionnaire: IUserQuestionnaire, cursor, userinfoSheet: any, col) {
    const username = userquestionnaire.user && userquestionnaire.user.userinfo ? userquestionnaire.user.userinfo.fullname : ''
    const email = userquestionnaire.user ? userquestionnaire.user.email : ''
    userinfoSheet[`A${cursor}`] = { v: username };
    const wchA = this.getStringLength(username);
    if (wchA > col[0].wch) {
      if (wchA > 50) {
        col[0].wch = 50;
      } else {
        col[0].wch = wchA;
      }
    }
    userinfoSheet[`B${cursor}`] = { v: email };
    const wchB = this.getStringLength(email);
    if (wchB > col[1].wch) {
      if (wchB > 50) {
        col[1].wch = 50;
      } else {
        col[1].wch = wchB;
      }
    }

    userquestionnaire.userinfoChoice.map((c, idx) => {
      const choiceArray: any = [];
      for (let choice of c.choice) {
        choiceArray.push(choice.content);
      }
      const str = String(choiceArray);
      const wch = this.getStringLength(str);
      if (wch > col[idx + 2].wch) {
        if (wch > 50) {
          col[idx + 2].wch = 50;
        } else {
          col[idx + 2].wch = wch;
        }
      }
      const total = idx + 2;
      const firstPos = parseInt(String(total / 26))
      const secondPos = total - firstPos * 26
      let pos;
      if (firstPos > 0) {
        pos = `${String.fromCharCode(64 + firstPos)}${String.fromCharCode(
          65 + secondPos
        )}${cursor}`;
      } else {
        pos = `${String.fromCharCode(65 + secondPos)}${cursor}`;
      }
      userinfoSheet[pos] = { v: str };
    });
    return cursor + 1;
  }

  async addUserfilter(
    userquestionnaire: IUserQuestionnaire,
    filterCursor,
    userfilterSheet: any,
    filterCol
  ) {
    for (let index = 0; index < userfilterSheet.length; index++) {
      const filterSheet = userfilterSheet[index];
      let cursor = filterCursor[index];
      if (!userquestionnaire.userfilterChoice[index]) {
        return;
      } else {
        const col = filterCol[index];

        for (let c of userquestionnaire.userfilterChoice[index]) {
          if (!c) {
            return;
          }
          const username = userquestionnaire.user && userquestionnaire.user.userinfo ? userquestionnaire.user.userinfo.fullname : ''
          let email = userquestionnaire.user ? userquestionnaire.user.email : ''
          filterSheet[`A${cursor}`] = { v: username };
          const wchA = this.getStringLength(username);
          if (wchA > col[0].wch) {
            if (wchA > 50) {
              col[0].wch = 50;
            } else {
              col[0].wch = wchA;
            }
          }
          filterSheet[`B${cursor}`] = { v: email };
          const wchB = this.getStringLength(email);
          if (wchB > col[1].wch) {
            if (wchB > 50) {
              col[1].wch = 50;
            } else {
              col[1].wch = wchB;
            }
          }
          let content = c.content;
          if (c.rateeType === "organization" && c.id) {
            email = "";
            content = await this.getOrgFullName(c.id);
          }
          filterSheet[`C${cursor}`] = {
            v: content
          };
          const wchC = this.getStringLength(content);
          if (wchC > col[2].wch) {
            if (wchC > 50) {
              col[2].wch = 50;
            } else {
              col[2].wch = wchC;
            }
          }
          filterSheet[`D${cursor}`] = {
            v: email
          };
          const wchD = this.getStringLength(email);
          if (wchD > col[3].wch) {
            if (wchD > 50) {
              col[3].wch = 50;
            } else {
              col[3].wch = wchD;
            }
          }

          filterSheet[`E${cursor}`] = {
            v: c.choose ? c.choose : 'Y'
          };
          const wchE = this.getStringLength(c.choose);
          if (wchE > col[4].wch) {
            if (wchE > 50) {
              col[4].wch = 50;
            } else {
              col[4].wch = wchD;
            }
          }
          cursor++;
        }
        filterCursor[index] = cursor;
      }
    }
  }
  async addSubject(query, subjectSheet, col) {
    const answers = await this.userAnswerService.findByCondition(query)
    if (!answers.length) {
      return;
    }
    await Promise.all(
      answers.map(async (ans, idx) => {
        subjectSheet[`A${idx + 2}`] = { v: ans.raterName };
        const wchA = this.getStringLength(ans.raterName);
        if (wchA > col[0].wch) {
          if (wchA > 50) {
            col[0].wch = 50;
          } else {
            col[0].wch = wchA;
          }
        }
        subjectSheet[`B${idx + 2}`] = { v: ans.raterEmail };
        const wchB = this.getStringLength(ans.raterEmail);
        if (wchB > col[1].wch) {
          if (wchB > 50) {
            col[1].wch = 50;
          } else {
            col[1].wch = wchB;
          }
        }
        let ratee = ans.rateeName;
        let email = ans.rateeEmail;
        if (ans.rateeType === "organization") {
          email = "";
          ratee = await this.getOrgFullName(ans.rateeId);
        }
        subjectSheet[`C${idx + 2}`] = { v: ratee };
        const wchC = this.getStringLength(ratee);
        if (wchC > col[2].wch) {
          if (wchC > 50) {
            col[2].wch = 50;
          } else {
            col[2].wch = wchC;
          }
        }
        subjectSheet[`D${idx + 2}`] = { v: email };
        const wchD = this.getStringLength(email);
        if (wchD > col[3].wch) {
          if (wchD > 50) {
            col[3].wch = 50;
          } else {
            col[3].wch = wchD;
          }
        }
        const endtTime = moment(ans.createdAt).format("YYYY-MM-DD HH:mm:ss");
        const startTime = moment(endtTime)
          .subtract(ans.completeTime, "minutes")
          .format("YYYY-MM-DD HH:mm:ss");
        subjectSheet[`E${idx + 2}`] = { v: startTime };
        const wchE = this.getStringLength(startTime);
        if (wchE > col[2].wch) {
          if (wchE > 50) {
            col[2].wch = 50;
          } else {
            col[2].wch = wchE;
          }
        }

        subjectSheet[`F${idx + 2}`] = { v: endtTime };
        const wchF = this.getStringLength(endtTime);
        if (wchF > col[3].wch) {
          if (wchF > 50) {
            col[3].wch = 50;
          } else {
            col[3].wch = wchF;
          }
        }

        let subjectCursor = 0;
        ans.answer.map(c => {
          const choiceArray = c.choice.map(value => {
            return value.content;
          });
          const str = String(choiceArray);
          const wch = this.getStringLength(str);
          if (wch > col[subjectCursor + 4].wch) {
            if (wch > 50) {
              col[subjectCursor + 4].wch = 50;
            } else {
              col[subjectCursor + 4].wch = wch;
            }
          }
          const total = subjectCursor + 6;
          const firstPos = parseInt(String(total / 26))
          const secondPos = total - firstPos * 26
          let pos;
          if (firstPos > 0) {
            pos = `${String.fromCharCode(64 + firstPos)}${String.fromCharCode(
              65 + secondPos
            )}${idx + 2}`;
          } else {
            pos = `${String.fromCharCode(65 + secondPos)}${idx + 2}`;
          }
          subjectSheet[pos] = { v: str };
          subjectCursor++;
          if (c.type === "scale") {
            const total = subjectCursor + 6;
            const scoreFirstPos = parseInt(String(total / 26))
            const scoreSecondPos = total - firstPos * 26

            let scorePos;
            if (scoreFirstPos > 0) {
              scorePos = `${String.fromCharCode(
                64 + scoreFirstPos
              )}${String.fromCharCode(65 + scoreSecondPos)}${idx + 2}`;
            } else {
              scorePos = `${String.fromCharCode(65 + scoreSecondPos)}${idx +
                2}`;
            }
            const score = _.find(ans.score, { scale: c.scaleId });
            subjectSheet[scorePos] = {
              v: Number(score.score).toFixed(3)
            };
            subjectCursor++;
          }
          return;
        });
      })
    );
    return;
  }

  async addSocial(query, socialSheets, socialCol) {
    const answers = await this.userAnswerService.findByCondition(query)
    if (!answers.length) {
      return;
    }
    for (let index = 0; index < socialSheets.length; index++) {
      const social = socialSheets[index];
      const col = socialCol[index];
      for (let idx = 0; idx < answers.length; idx++) {
        const ans = answers[idx];
        social[`A${idx + 2}`] = { v: ans.raterName };
        const wchA = this.getStringLength(ans.raterName);
        if (wchA > col[0].wch) {
          if (wchA > 50) {
            col[0].wch = 50;
          } else {
            col[0].wch = wchA;
          }
        }
        social[`B${idx + 2}`] = { v: ans.raterEmail };
        const wchB = this.getStringLength(ans.raterEmail);
        if (wchB > col[1].wch) {
          if (wchB > 50) {
            col[1].wch = 50;
          } else {
            col[1].wch = wchB;
          }
        }
        let ratee = ans.rateeName;
        let email = ans.rateeEmail;
        if (ans.rateeType === "organization") {
          email = "";
          ratee = await this.getOrgFullName(ans.rateeId);
        }
        social[`C${idx + 2}`] = { v: ratee };
        const wchC = this.getStringLength(ratee);
        if (wchC > col[2].wch) {
          if (wchC > 50) {
            col[2].wch = 50;
          } else {
            col[2].wch = wchC;
          }
        }
        social[`D${idx + 2}`] = { v: email };
        const wchD = this.getStringLength(email);
        if (wchD > col[3].wch) {
          if (wchD > 50) {
            col[3].wch = 50;
          } else {
            col[3].wch = wchD;
          }
        }

        const endtTime = moment(ans.createdAt).format("YYYY-MM-DD HH:mm:ss");
        const startTime = moment(endtTime)
          .subtract(ans.completeTime, "minutes")
          .format("YYYY-MM-DD HH:mm:ss");
        social[`E${idx + 2}`] = { v: startTime };
        const wchE = this.getStringLength(startTime);
        if (wchE > col[2].wch) {
          if (wchE > 50) {
            col[2].wch = 50;
          } else {
            col[2].wch = wchE;
          }
        }

        social[`F${idx + 2}`] = { v: endtTime };
        const wchF = this.getStringLength(endtTime);
        if (wchF > col[3].wch) {
          if (wchF > 50) {
            col[3].wch = 50;
          } else {
            col[3].wch = wchF;
          }
        }
        const choiceArray: any = [];
        for (let c of ans.answer[index].choice) {
          choiceArray.push(c.content);
        }
        const str = String(choiceArray);
        social[`G${idx + 2}`] = { v: str };
        const wchG = this.getStringLength(str);
        if (wchG > col[4].wch) {
          if (wchG > 50) {
            col[4].wch = 50;
          } else {
            col[4].wch = wchG;
          }
        }
      }
    }
  }

  async getOrgFullName(organizationId) {
    const organization = await this.organizationService.findById(organizationId);
    if (!organization) {
      return ''
    }
    const content = organization.name;
    if (!organization.parent) {
      return content;
    } else {
      const pre = await this.getOrgFullName(organization.parent);
      return `${pre}-${content}`;
    }
  }

  getStringLength(sourceStr = "") {
    const str = sourceStr
    let realLength = 0;
    let len = 0;
    if (str !== null) {
      len = str.length;
    }
    let charCode = -1;
    for (let i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) realLength += 1;
      else realLength += 2;
    }
    return realLength + 2;
  }
}