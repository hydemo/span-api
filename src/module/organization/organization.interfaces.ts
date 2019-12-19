import { Document } from 'mongoose';

export interface IOrganization extends Document {
  //企业id
  companyId: string;
  //组织名称
  readonly name: string;
  //组织所在层级
  readonly layer: number;
  //层级名称
  readonly layerLength: number;
  //所有者id
  readonly ownerId: string;
  //所有者名称
  readonly ownerName: string;
  //组织的上层id
  readonly parent: string;
  //组织的下层id
  readonly children: [string];
  //员工数
  readonly staffNumber: number;
  //生成者id
  readonly producerId: string;
  //是否删除
  readonly isDelete: boolean;
  //是否删除
  readonly hasChildren: boolean;

}