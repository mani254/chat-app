import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as sign } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import mime from "mime-types";
import { BUCKET, r2 } from "../config/cloudfare";
dotenv.config();

export async function bulkDeleteFiles(keys: string[]) {
  if (!keys.length) return { deleted: [] };
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    })
  );
  return { deleted: keys };
}

export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  return { deleted: true, key };
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err: any) {
    if (err.name === "NotFound") return false;
    throw err;
  }
}

export async function getSignedUrl(key: string, expiresInSeconds = 3600) {
  return await sign(r2, new HeadObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: expiresInSeconds,
  });
}

export async function listFilesByTenant(params: {
  chatId: string;
  maxKeys?: number;
  continuationToken?: string;
}) {
  const { chatId, maxKeys = 20, continuationToken } = params;
  const res = await r2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `${chatId}/`,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    })
  );

  return {
    files:
      res.Contents?.map((i) => ({
        key: i.Key!,
        size: i.Size,
        lastModified: i.LastModified,
      })) || [],
    nextToken: res.NextContinuationToken || null,
    isTruncated: res.IsTruncated || false,
  };
}

export async function renameFile(oldKey: string, newFileName: string) {
  const chatId = oldKey.split("/")[0];
  const ext = oldKey.split(".").pop();
  const newKey = `${chatId}/${newFileName}.${ext}`;

  await r2.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${oldKey}`,
      Key: newKey,
      ACL: "private",
    })
  );

  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: oldKey,
    })
  );

  return { oldKey, newKey };
}

export async function uploadMultipleFiles(params: {
  chatId: string;
  files: { buffer: Buffer; originalName: string }[];
  maxSizeMB?: number;
  allowedTypes?: string[];
  makePublic?: boolean;
}) {
  const { files, ...rest } = params;
  return Promise.all(
    files.map((file) =>
      uploadSingleFile({
        ...rest,
        fileBuffer: file.buffer,
        originalName: file.originalName,
      })
    )
  );
}

export async function uploadSingleFile(params: {
  chatId: string;
  fileBuffer: Buffer;
  originalName: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  makePublic?: boolean;
}) {
  const {
    chatId,
    fileBuffer,
    originalName,
    maxSizeMB = 20,
    allowedTypes,
    makePublic = false,
  } = params;

  const sizeMB = fileBuffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) throw new Error(`File too large. Max ${maxSizeMB}MB`);

  const mimeType = mime.lookup(originalName) || "application/octet-stream";
  if (allowedTypes && !allowedTypes.includes(mimeType))
    throw new Error(`Invalid type: ${mimeType}`);

  const ext = mime.extension(mimeType) || "bin";
  const key = `${chatId}/${randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: makePublic ? "public-read" : undefined,
    })
  );

  const url = makePublic
    ? `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`
    : await sign(r2, new HeadObjectCommand({ Bucket: BUCKET, Key: key }), {
        expiresIn: 3600,
      });

  return { key, url, mimeType, size: fileBuffer.length };
}
