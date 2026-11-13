import path from 'path';
import fs from 'fs';

// 上传目录配置
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const UPLOAD_IMAGE_DIR = path.resolve(UPLOAD_DIR, 'images');

// 确保上传目录存在
export function ensureUploadDirs() {
  const dirs = [UPLOAD_DIR, UPLOAD_IMAGE_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // 递归创建
    }
  }
}

// 文件大小限制 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 允许的图片 MIME 类型
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 根据 MIME 类型判断文件类型
export function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('application/')) return 'document';
  return 'other';
}

// 获取文件访问 URL 路径
export function getFileUrl(fileName: string, type: string = 'images'): string {
  return `/api/files/${type}/${fileName}`;
}
