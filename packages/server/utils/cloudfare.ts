import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as sign } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import mime from 'mime-types';
import { BUCKET, r2 } from '../config/cloudfare';
dotenv.config();

export async function bulkDeleteFiles(keys: string[]) {
  if (!keys.length) return { deleted: [] };
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
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
    if (err.name === 'NotFound') return false;
    throw err;
  }
}

export async function getSignedUrl(key: string, expiresInSeconds = 3600) {
  return await sign(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: expiresInSeconds,
  });
}

export async function listFilesByFolder(params: { folder: string; maxKeys?: number; continuationToken?: string }) {
  const { folder, maxKeys = 20, continuationToken } = params;
  const res = await r2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `${folder}/`,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    }),
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

export async function renameFile(oldKey: string, newKeyOrFileName: string) {
  // If a full key (with folder prefix) is provided, use it directly.
  // Otherwise, treat input as a filename within the same folder, preserving extension.
  const isFullKey = newKeyOrFileName.includes('/');
  let newKey: string;
  if (isFullKey) {
    newKey = newKeyOrFileName;
  } else {
    const folder = oldKey.split('/')[0];
    const parts = oldKey.split('.');
    const ext = parts.length > 1 ? parts.pop() : undefined;
    newKey = ext ? `${folder}/${newKeyOrFileName}.${ext}` : `${folder}/${newKeyOrFileName}`;
  }

  await r2.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${oldKey}`,
      Key: newKey,
      ACL: 'private',
    }),
  );

  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: oldKey,
    }),
  );

  return { oldKey, newKey };
}

export async function uploadMultipleFiles(params: {
  folder: string;
  files: { buffer: Buffer; originalName?: string; contentType?: string; key?: string }[];
  makePublic?: boolean;
}) {
  const { files, ...rest } = params;
  return Promise.all(
    files.map((file) =>
      uploadSingleFile({
        ...rest,
        fileBuffer: file.buffer,
        originalName: file.originalName,
        contentType: file.contentType,
        key: file.key,
      }),
    ),
  );
}

export async function uploadSingleFile(params: {
  folder: string;
  fileBuffer: Buffer;
  originalName?: string;
  contentType?: string;
  makePublic?: boolean;
  key?: string;
}) {
  const { folder, fileBuffer, originalName, contentType, makePublic = false, key: providedKey } = params;

  const mimeType =
    contentType ||
    (originalName ? mime.lookup(originalName) || 'application/octet-stream' : 'application/octet-stream');

  // Preserve original extension if available, otherwise default to 'bin'.
  const key = providedKey
    ? providedKey
    : (() => {
        const lastDotIndex = originalName ? originalName.lastIndexOf('.') : -1;
        const ext =
          originalName && lastDotIndex > 0 && lastDotIndex < originalName.length - 1
            ? originalName.substring(lastDotIndex + 1).toLowerCase()
            : 'bin';
        return `${folder}/${randomUUID()}.${ext}`;
      })();

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: makePublic ? 'public-read' : undefined,
    }),
  );

  const url = makePublic
    ? `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`
    : await sign(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
        expiresIn: 3600,
      });

  return { key, url, mimeType, size: fileBuffer.length };
}
