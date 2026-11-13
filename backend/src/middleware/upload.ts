import multer from '@koa/multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UPLOAD_IMAGE_DIR,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
} from '../config/upload';

// 通用文件上传配置
const commonStorage = multer.diskStorage({
  destination: (
    _req: any,
    _file: any,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, UPLOAD_IMAGE_DIR);
  },
  filename: (
    _req: any,
    file: { originalname: string },
    cb: (error: Error | null, filename: string) => void,
  ) => {
    // 生成唯一文件名，保留原始扩展名
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// 文件类型过滤器（只允许图片）
const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile?: boolean) => void,
) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP, SVG)'));
  }
};

// 图片上传配置（单文件）
export const uploadSingleImage = multer({
  storage: commonStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: imageFileFilter,
}).single('file');

// 图片上传配置（多文件，最多10个）
export const uploadMultipleImages = multer({
  storage: commonStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: imageFileFilter,
}).array('files', 10);
