import { Context, Next } from 'koa';
import logger from '../utils/logger';

/**
 * HTTP 请求日志中间件
 */
export async function loggerMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  
  // 记录请求信息
  const { method, url, headers, requestId } = ctx;
  const userAgent = headers['user-agent'] || '';
  
  // 敏感信息过滤
  const sanitizedHeaders = {
    ...headers,
    authorization: headers.authorization ? '***' : undefined,
  };

  logger.http('Incoming Request', {
    method,
    url,
    requestId,
    userAgent,
    headers: sanitizedHeaders,
  });

  try {
    await next();

    // 记录响应信息
    const duration = Date.now() - start;
    const { status, body } = ctx;

    logger.http('Request Completed', {
      method,
      url,
      requestId,
      status,
      duration: `${duration}ms`,
    });
  } catch (error: any) {
    // 错误会在错误处理中间件处理，但这里可以先记录一下
    const duration = Date.now() - start;
    logger.error('Request Failed', {
      method,
      url,
      requestId,
      duration: `${duration}ms`,
      error,
    });
    throw error;
  }
}
