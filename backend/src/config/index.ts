import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`[Config] 缺少必需的环境变量: ${key}`);
  }
  return value;
}

export const config = {
  /** 运行环境 */
  nodeEnv: required('NODE_ENV', 'development'),
  /** 服务端口 */
  port: parseInt(required('PORT', '3000'), 10),

  /** JWT 密钥 */
  jwtSecret: required('JWT_SECRET', 'accounting-assistant-secret-dev'),

  /** 数据库连接字符串 */
  databaseUrl: required('DATABASE_URL'),

  log: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
} as const;

export type AppConfig = typeof config;
