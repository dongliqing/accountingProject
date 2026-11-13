import "koa";
import type { AuthUser } from "../middleware/auth";

/**
 * 扩展 Koa Context 类型
 * 添加 requestId、user 和统一响应方法
 */
declare module "koa" {
  interface BaseContext {
    /** 当前请求 ID（由 requestIdMiddleware 注入） */
    requestId: string;

    state: {
      requestId: string;
      user?: AuthUser;
      config?: import("../config").AppConfig;
      [key: string]: any;
    };

    /**
     * 成功响应
     * @example ctx.success({ users: [...] }, "获取成功")
     */
    success(data?: any, message?: string): void;

    /**
     * 分页响应
     * @example ctx.paginate(users, { page: 1, pageSize: 20, total: 100 })
     */
    paginate(
      data: any[],
      pagination: { page: number; pageSize: number; total: number },
    ): void;
  }
}

export {};
