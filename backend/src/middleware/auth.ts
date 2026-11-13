import { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError } from "./error.handler";

// ──────────────────────────────────────────────
// JWT 认证中间件
// ──────────────────────────────────────────────

export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}

export async function authMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("未提供认证 token");
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    ctx.state.user = decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token 已过期，请重新登录");
    }
    throw new UnauthorizedError("无效的 Token");
  }

  await next();
}
