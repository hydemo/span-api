import { Document } from 'mongoose';

export interface ITag extends Document {
  //标签
  readonly tag: string;
}