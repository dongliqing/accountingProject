import { Context, Next } from "koa";
import logger from "../utils/logger";

// ──────────────────────────────────────────────
// 自定义业务错误类
// ──────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public businessCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, 40400, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(200, 40000, message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, 40100, message);
    this.name = "UnauthorizedError";
  }
}

// ──────────────────────────────────────────────
// 全局错误处理中间件
// ──────────────────────────────────────────────

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    // 记录错误详情
    const requestId = ctx.state.requestId ?? "unknown";
    
    // 完整记录错误堆栈和上下文信息
    logger.error('Request Error', {
      requestId,
      method: ctx.method,
      path: ctx.path,
      message: err.message,
      error: err,
      stack: err.stack,
      statusCode: err.statusCode,
      businessCode: err.businessCode,
      code: err.code, // Prisma 错误码
    });

    // 业务错误 → 使用其自身状态码
    if (err instanceof AppError) {
      ctx.status = err.statusCode;
      ctx.body = {
        success: false,
        code: err.businessCode,
        message: err.message,
        data: null,
        requestId,
      };
      return;
    }

    // Prisma Known Request Error（如唯一约束冲突）
    if (err.code === "P2002") {
      ctx.status = 409;
      ctx.body = {
        success: false,
        code: 40900,
        message: "资源已存在（唯一约束冲突）",
        data: null,
        requestId,
      };
      return;
    }

    // 兜底: 未知错误
    ctx.status = err.status ?? err.statusCode ?? 500;
    ctx.body = {
      success: false,
      code: 50000,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message ?? "Internal server error",
      data: null,
      requestId,
    };
  }
}
