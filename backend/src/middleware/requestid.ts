import { Context, Next } from "koa";
import { v4 as uuidv4 } from "uuid";

/**
 * 请求 ID 中间件
 * - 优先使用上游传入的 X-Request-ID（如网关 / 负载均衡器）
 * - 否则自动生成 UUID
 * - 注入到 ctx.state.requestId，供后续中间件 & 日志使用
 */
export async function requestIdMiddleware(ctx: Context, next: Next) {
  const requestId =
    (ctx.get("X-Request-ID") as string) ||
    (ctx.state.requestId as string) ||
    uuidv4();

  ctx.state.requestId = requestId;
  ctx.set("X-Request-ID", requestId);

  await next();
}
