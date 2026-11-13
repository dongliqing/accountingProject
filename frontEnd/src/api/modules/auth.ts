import instance from '@/api/index';
import type { ApiResponse } from '@/api/index';

// ──────────────────────────────────────────────
// 认证 API 模块
// ──────────────────────────────────────────────

/** 登录响应数据 */
export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
  };
}

/** 登录请求参数 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 用户登录
 * 前端对密码做 SHA-256 哈希后传输，后端比对 bcrypt
 */
export async function login(username: string, password: string) {
  // 前端先对密码做一次 SHA-256 哈希，避免明文传输
  const hashedPassword = await sha256(password);

  const params: LoginParams = { username, password: hashedPassword };

  const res = await instance.post<ApiResponse<LoginResult>>(
    '/auth/login',
    params,
  );

  return res.data;
}

/**
 * SHA-256 哈希工具 — 使用浏览器原生 SubtleCrypto
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
