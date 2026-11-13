import { Context } from "koa";
import prisma from "../services/prisma";
import { NotFoundError } from "../middleware/error.handler";
import {
  createUserSchema,
  paginationSchema,
  CreateUserSchemaType,
  PaginationSchemaType,
} from "../validators";

// ──────────────────────────────────────────────
// 用户 Controller
// ──────────────────────────────────────────────

/** GET /api/users — 获取用户列表 (分页) */
export async function getUsers(ctx: Context) {
  // 使用 zod 验证查询参数
  const { page, pageSize } = ctx.state.validated.query as PaginationSchemaType;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  ctx.body = {
    success: true,
    code: 0,
    message: "获取成功",
    data: {
      list: users,
      pagination: { page, pageSize, total },
    },
    requestId: ctx.state.requestId,
  };
}

/** GET /api/users/:id — 获取单个用户详情 */
export async function getUserById(ctx: Context) {
  const { id } = ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      createdAt: true,
      bills: {
        take: 10,
        orderBy: { occurredAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          note: true,
          occurredAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  ctx.body = {
    success: true,
    code: 0,
    message: "获取成功",
    data: user,
    requestId: ctx.state.requestId,
  };
}

/** POST /api/users — 创建用户 */
export async function createUser(ctx: Context) {
  // 使用 zod 验证请求体
  const body = ctx.state.validated.body as CreateUserSchemaType;
  const { email, username, passwordHash, avatar, phone } = body;

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: passwordHash ?? "placeholder",
      avatar: avatar ?? null,
      phone: phone ?? null,
    },
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    code: 0,
    message: "创建成功",
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    },
    requestId: ctx.state.requestId,
  };
}
