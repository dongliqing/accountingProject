import { Context } from "koa";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma";
import { config } from "../config";
import { UnauthorizedError } from "../middleware/error.handler";

// ──────────────────────────────────────────────
// 认证 Controller
// ──────────────────────────────────────────────

const JWT_EXPIRES_IN = "7d";

export interface LoginRequest {
  username: string;
  password: string; // 前端 SHA-256 加密后的密码
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    avatar: string | null;
    phone: string | null;
    role: string;
  };
}

/** POST /api/auth/login — 用户名密码登录 */
export async function login(ctx: Context) {
  const body = ctx.request.body as Record<string, unknown>;
  const { username, password } = body as unknown as LoginRequest;

  // if (!username || !password) {
  //   throw new BadRequestError("用户名和密码不能为空");
  // }
  
  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new UnauthorizedError("用户名或密码错误");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("账号已被禁用");
  }

  // 前端传入 SHA-256 哈希后的密码，后端用 bcrypt 比对
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new UnauthorizedError("用户名或密码错误");
  }

  // 生成 JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN },
  );

  ctx.body = {
    success: true,
    code: 0,
    message: "登录成功",
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
      },
    } satisfies LoginResponse,
    requestId: ctx.state.requestId,
  };
}
