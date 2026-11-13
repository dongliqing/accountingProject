import { z } from 'zod';

// ──────────────────────────────────────────────
// 认证相关 Schema
// ──────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// 用户相关 Schema
// ──────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.email({ message: 'email 格式不正确' }),
  username: z.string().min(1, '用户名不能为空'),
  passwordHash: z.string().optional(),
  avatar: z.url({ message: 'avatar 必须是有效的 URL' }).optional(),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .optional(),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type PaginationSchemaType = z.infer<typeof paginationSchema>;
