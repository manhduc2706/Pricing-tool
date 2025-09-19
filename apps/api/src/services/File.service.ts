import { FileModel, IFile } from "../models/File.model";
import { CreateFile } from "../types/quotation";

export class FileService {
  async create(data: CreateFile): Promise<IFile> {
    const newFile = new FileModel(data);
    return await newFile.save();
  }
}
