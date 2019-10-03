import * as  XLSX from "xlsx";
import { Model } from 'mongoose';
import * as md5 from 'md5';
import * as  _ from "lodash";
import { Injectable, Inject } from "@nestjs/common";
import { CryptoUtil } from "src/utils/crypto.util";
import { OrganizationService } from "../organization/organization.service";
import { IUser } from "./user.interfaces";

@Injectable()
export class XlsxService {
    constructor(
        @Inject('UserModelToken') private readonly userModel: Model<IUser>,
        @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
        @Inject(OrganizationService) private readonly organizationService: OrganizationService,
    ) { }
    /**
      * ----{根据excel表格生成组织架构}----
      * @param {Object} layers 层级详情
      * @param {String} companyId 企业id
      * @returns {Promise} primise
      * @author:oy
      */

    async genOrganization(layers, companyId) {
        const organizations: any = [];
        const company = await this.organizationService.findById(companyId);
        for (let layer of layers) {
            let parent;
            for (let i = 0; i < layer.length; i++) {
                if (i === 0) {
                    parent = company;
                }
                const organizationObject = {
                    companyId: companyId,
                    name: layer[i],
                    layer: i + 1,
                    parent: parent._id
                };
                const exist = await this.organizationService.findOneByCondition({
                    name: layer[i],
                    parent: parent._id
                });

                if (!exist) {
                    const child = await this.organizationService.creatSub(organizationObject);
                    organizations.push({
                        layerName: child.name,
                        layerId: String(child._id),
                        parentId: String(parent._id),
                        layer: i + 1
                    });
                    await this.organizationService.findByIdAndUpdate(parent._id, { $addToSet: { children: child._id }, hasChildren: true });
                    parent = child;
                } else {
                    organizations.push({
                        layerName: exist.name,
                        layerId: String(exist._id),
                        parentId: String(exist.parent),
                        layer: i + 1
                    });
                    parent = exist;
                }
            }
        }
        return _.uniqBy(organizations, "layerId");
    }
    /**
     *----{将员工打包成数据库所需格式}----
     * @param {Object} users 层级详情对象
     * @param {Array} layerName 层级数组
     * @param {Array} organizations 组织详情
     * @param {Object} company 企业
     * @returns {Promise} promise
     * @author:oy
     */
    genUser(users, layerName, organizations, company) {
        return users.map(user => {
            let layerLine: any = [];
            let layerId;
            let layer;
            let parentId = String(company._id);
            let isLeader;
            for (let i = 0; i < layerName.length; i++) {
                if (user[layerName[i]]) {
                    const currentLayer = _.find(organizations, {
                        layer: i + 1,
                        layerName: user[layerName[i]],
                        parentId
                    });
                    isLeader = user[`isLeader_layer_${i + 1}`];
                    if (isLeader === '是' || isLeader === 'yes') {
                        isLeader = 1
                    }
                    if (isLeader === '否' || isLeader === 'no') {
                        isLeader = 0
                    }
                    const layerObject = Object.assign({ isLeader }, currentLayer);
                    layerLine.push(layerObject);
                    parentId = currentLayer.layerId;
                    layer = i + 1;
                    layerId = currentLayer.layerId
                }
            }
            let fullname;
            if (!user.fullname) {
                fullname = `${user.firstname} ${user.surname}`;
            } else {
                fullname = user.fullname;
            }
            const object: any = {
                companyId: company._id,
                companyName: company.name,
                layerId,
                layer,
                layerLine,
                username: user.username,
                email: user.email.toLowerCase(),
                isLeader,
                userinfo: {
                    //姓
                    surname: user.surname || "",
                    //名
                    firstname: user.firstname || "",
                    //姓名
                    fullname,
                    //别名
                    preferredName: user.preferredName || "",
                    //最高学历
                    highestDegree: user.highestDegree || "",
                    //毕业院校
                    institute: user.institute || "",
                    //毕业时间
                    GradYear: user.GradYear || "",
                    //性别
                    gender: user.gender,
                    //民族
                    ethnicGroup: user.ethnicGroup || "",
                    //婚姻状态
                    maritalStatus: user.maritalStatus || "",
                    //出生日期
                    BirthDate: user.BirthDate || "",
                    //入职时间
                    hireDate: user.hireDate || "",
                    //岗位名称
                    jobTitle: user.jobTitle || "",
                    //职位
                    jobPosition: user.jobPosition || "",
                    //工作地点
                    jobLocation: user.jobLocation || "",
                    //聘任状态
                    employmentStatus: user.employmentStatus || ""
                }
            };
            if (user.phone) object.phone = user.phone;
            if (user.password) {
                Object.assign(object, {
                    password: this.cryptoUtil.encryptPassword(md5(user.password)),
                    isActive: true
                });
            }
            return object;
        });
    }
    /**
     * ----{处理excel表格，获得worksheet}----
     * @param {String} path 表格路径
     * @returns {Promise} promise
     * @author:oy
     */
    async getWorksheet(path) {
        const workbook = XLSX.readFile(path);
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        return worksheet;
    }
    /**
     * ----{获取excel表格的表头}----
     * @param {Object} worksheet worksheet对象
     * @param {Object} title 模板title转化对象
     * @returns {Promise} promise
     * @author:oy
     */
    async getTitle(worksheet, title) {
        const headers = {};
        const headerArray: any = [];
        let length = 0;
        let language = "zh";
        const keys = Object.keys(worksheet).filter(k => k[0] !== "!");
        for (let key of keys) {
            const col = key.substring(0, 1);
            const row = parseInt(key.substring(1));
            const value = worksheet[key].v;
            if (row === 1) {
                const str = value.replace(/ /g, "").toLowerCase();
                if (str.indexOf("级部门领导") > -1) {
                    headers[col] = `isLeader_layer_${str[0]}`;
                    continue;
                } else if (str.indexOf("leader") > -1) {
                    language = "en-US";
                    headers[col] = `isLeader_layer_${str[5]}`;
                    continue;
                } else if (str.indexOf("级部门") > -1) {
                    headers[col] = `department_layer_${value[0]}`;
                    length++;
                    continue;
                } else if (str.indexOf("dept.level") > -1) {
                    headers[col] = `department_layer_${str[10]}`;
                    length++;
                    continue;
                } else {
                    headers[col] = title[str];
                    continue;
                }
            } else break;
        }
        for (let header in headers) {
            headerArray.push(headers[header]);
        }
        return { headers, headerArray, language, length };
    }
    /**
     * ----{批量新增users}----
     * @param {Object} users excel表格中user对象
     * @returns {Promise} promise
     * @author:oy
     */
    async addUsers(users) {
        let newUserNum = 0;
        let updateUserNum = 0;
        await Promise.all(
            users.map(async user => {
                const emailExist = await this.userModel.findOne({ email: user.email.toLowerCase() });
                if (emailExist) {
                    await this.userModel.findByIdAndUpdate(emailExist._id, user);
                    updateUserNum++;
                } else {
                    await this.userModel.create(user);
                    newUserNum++;
                }
            })
        );
        const userInfo = {
            newUserNum,
            updateUserNum
        };
        return userInfo;
    }
    /**
     * ----{获取层级详情}----
     * @param {Object} users user对象
     * @param {Object} headers headers对象
     * @returns {Promise} promise
     * @author:oy
     */
    async getLayer(users, headers) {
        const layerNames: any = [];
        const layerHeaders: any = [];
        const layers: any = [];
        //获取层级名称和层级数
        for (let header of headers)
            if (header.indexOf("department") > -1) layerHeaders.push(header);
        for (let user of users) {
            const layer: any = [];
            for (let layerHeader of layerHeaders) {
                if (user[layerHeader]) {
                    layerNames.push(layerHeader);
                    layer.push(user[layerHeader]);
                }
            }
            let exist = false;
            for (let lay of layers) {
                if (`${lay}` === `${layer}`) exist = true;
            }
            if (!exist) layers.push(layer);
        }
        return { layers, layerNames: _.uniq(layerNames) };
    }
    getUsers(worksheet, headers) {
        let length = worksheet["!ref"].split(":")[1].substring(1);
        // b = _.isNumber(length[0])
        if (!"0123456789".includes(length[0])) length = length.substring(1);
        let users: any = [];
        for (let i = 2; i <= length; i++) {
            let user = {};
            for (let header in headers) {
                if (worksheet[`${header}${i}`]) {
                    user[`${headers[header]}`] = String(worksheet[`${header}${i}`].v);
                }
            }
            users.push(user);
        }
        return users;
    }
}