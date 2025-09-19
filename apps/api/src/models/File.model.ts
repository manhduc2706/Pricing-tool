import { model, Schema, Types } from "mongoose";

export interface IFile {
  _id?: Types.ObjectId;
  fileName: string;
  fileKey: string;
  bucket: string;
}

const fileSchema = new Schema<IFile>(
  {
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true },
    bucket: { type: String, required: true },
  },
  { timestamps: true }
);

export const FileModel = model<IFile>("File", fileSchema);
