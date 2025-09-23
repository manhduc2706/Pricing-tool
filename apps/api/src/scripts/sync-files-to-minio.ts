import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { FileModel } from "../models/File.model"; // fileName, fileKey, bucket
import { getMinIOClient } from "../configs/minio.config";

export async function syncDbFilesToMinio() {
  await mongoose.connect("mongodb://admin:admin123@pricing-tool-mongo:27017/pricing-tool?authSource=admin");

  const client = getMinIOClient();
  const files = await FileModel.find();

  for (const file of files) {
    const { fileName, fileKey, bucket } = file;

    //Đường dẫn ảnh ở local
    const localPath = path.join(process.cwd(), "src", "images", fileName);

    if (!fs.existsSync(localPath)) {
      console.warn(`File not found locally: ${localPath}`);
      continue;
    }

    try {
      // check bucket
      const exists = await client.bucketExists(bucket).catch(() => false);
      if (!exists) {
        await client.makeBucket(bucket, "us-east-1");
        console.log(`Bucket "${bucket}" created`);
      }

      // check object tồn tại hay chưa
      let alreadyExists = false;
      try {
        await client.statObject(bucket, fileKey);
        alreadyExists = true;
      } catch (_) {
        alreadyExists = false;
      }

      if (alreadyExists) {
        console.log(`Skip (already exists): ${bucket}/${fileKey}`);
      } else {
        await client.fPutObject(bucket, fileKey, localPath, {
          "Content-Type": "image/png",
        });
        console.log(`Uploaded: ${bucket}/${fileKey}`);
      }
    } catch (err) {
      console.error(`Failed to sync ${fileName}`, err);
    }
  }

  await mongoose.disconnect();
}
