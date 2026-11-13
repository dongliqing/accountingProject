import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import prisma from '../services/prisma';
import logger from '../utils/logger';
import {
  getFileType,
  getFileUrl,
  UPLOAD_DIR,
} from '../config/upload';

// ──────────────────────────────────────────────
// 文件上传 Controller
// ──────────────────────────────────────────────

/**
 * 单文件上传
 */
export async function uploadSingleFile(ctx: Context) {
  try {
    const file = ctx.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        code: 40000,
        message: '请选择要上传的文件',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    // 保存文件记录到数据库
    const userId = ctx.state.user?.userId;
    const fileRecord = await prisma.uploadedFile.create({
      data: {
        userId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileType: getFileType(file.mimetype),
      },
    });

    logger.info('文件上传成功', {
      requestId: ctx.state.requestId,
      fileId: fileRecord.id,
      originalName: file.originalname,
      userId,
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      code: 0,
      message: '文件上传成功',
      data: {
        fileId: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        fileUrl: getFileUrl(fileRecord.fileName, 'images'),
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        fileType: fileRecord.fileType,
      },
      requestId: ctx.state.requestId,
    };
  } catch (error: any) {
    logger.error('单文件上传失败', {
      requestId: ctx.state.requestId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * 多文件上传
 */
export async function uploadMultipleFiles(ctx: Context) {
  try {
    const files = ctx.files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        code: 40000,
        message: '请选择要上传的文件',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    // 批量保存文件记录
    const userId = ctx.state.user?.userId;
    const fileRecords = await Promise.all(
      files.map(async (file) => {
        return prisma.uploadedFile.create({
          data: {
            userId,
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            fileType: getFileType(file.mimetype),
          },
        });
      }),
    );

    logger.info('多文件上传成功', {
      requestId: ctx.state.requestId,
      fileCount: fileRecords.length,
      userId,
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      code: 0,
      message: `成功上传 ${fileRecords.length} 个文件`,
      data: {
        files: fileRecords.map((record) => ({
          fileId: record.id,
          fileName: record.fileName,
          originalName: record.originalName,
          fileUrl: getFileUrl(record.fileName, 'images'),
          fileSize: record.fileSize,
          mimeType: record.mimeType,
          fileType: record.fileType,
        })),
      },
      requestId: ctx.state.requestId,
    };
  } catch (error: any) {
    logger.error('多文件上传失败', {
      requestId: ctx.state.requestId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * 获取文件信息
 */
export async function getFileInfo(ctx: Context) {
  const fileId = ctx.params.fileId;
  try {
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        code: 40400,
        message: '文件不存在',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      success: true,
      code: 0,
      message: '获取成功',
      data: {
        fileId: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        fileUrl: getFileUrl(fileRecord.fileName, 'images'),
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        fileType: fileRecord.fileType,
        createdAt: fileRecord.createdAt,
      },
      requestId: ctx.state.requestId,
    };
  } catch (error: any) {
    logger.error('获取文件信息失败', {
      requestId: ctx.state.requestId,
      fileId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * 下载文件（强制浏览器下载，而非内联预览）
 */
export async function downloadFile(ctx: Context) {
  const fileId = ctx.params.fileId;
  try {
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        code: 40400,
        message: '文件不存在',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    // 防止路径遍历：确保解析后的路径仍在 uploads 目录内
    const resolvedPath = path.resolve(fileRecord.filePath);
    const uploadRoot = path.resolve(UPLOAD_DIR);
    if (!resolvedPath.startsWith(uploadRoot + path.sep)) {
      logger.error('下载文件路径异常', {
        requestId: ctx.state.requestId,
        fileId,
        filePath: fileRecord.filePath,
        resolvedPath,
      });
      ctx.status = 400;
      ctx.body = {
        success: false,
        code: 40000,
        message: '文件路径异常',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    if (!fs.existsSync(resolvedPath)) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        code: 40400,
        message: '文件已被删除或移动',
        data: null,
        requestId: ctx.state.requestId,
      };
      return;
    }

    // 设置响应头，触发浏览器下载
    ctx.attachment(fileRecord.originalName);
    ctx.type = fileRecord.mimeType;
    ctx.length = fileRecord.fileSize;
    ctx.body = fs.createReadStream(resolvedPath);

    logger.info('文件下载成功', {
      requestId: ctx.state.requestId,
      fileId,
      originalName: fileRecord.originalName,
      fileSize: fileRecord.fileSize,
    });
  } catch (error: any) {
    logger.error('文件下载失败', {
      requestId: ctx.state.requestId,
      fileId,
      error: error.message,
    });
    throw error;
  }
}
