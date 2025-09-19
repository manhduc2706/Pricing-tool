import { Schema, Types, model } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  name: string; //Tên danh mục
  iconKey: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    iconKey: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = model<ICategory>("Category", CategorySchema);
