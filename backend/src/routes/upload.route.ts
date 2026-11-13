import Router from '@koa/router';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getFileInfo,
  downloadFile,
} from '../controllers/upload.controller';
import {
  uploadSingleImage,
  uploadMultipleImages,
} from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/api/upload' });

/**
 * 单文件上传（图片）
 * POST /api/upload/image
 */
router.post(
  '/image',
  authMiddleware,
  uploadSingleImage,
  uploadSingleFile,
);

/**
 * 多文件上传（图片，最多10个）
 * POST /api/upload/images
 */
router.post(
  '/images',
  authMiddleware,
  uploadMultipleImages,
  uploadMultipleFiles,
);

/**
 * 获取文件信息
 * GET /api/upload/file/:fileId
 */
router.get(
  '/file/:fileId',
  authMiddleware,
  getFileInfo,
);

/**
 * 下载文件（强制浏览器下载）
 * GET /api/upload/download/:fileId
 */
router.get(
  '/download/:fileId',
  authMiddleware,
  downloadFile,
);

export default router;
