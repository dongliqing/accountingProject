import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import serve from "koa-static"; 
import mount from "koa-mount";

import { config } from "./config";
import { requestIdMiddleware } from "./middleware/requestid";
import { errorHandler } from "./middleware/error.handler";
import { loggerMiddleware } from "./middleware/logger";
import logger from "./utils/logger";
import { ensureUploadDirs, UPLOAD_DIR } from "./config/upload";
import router from "./routes";

const app = new Koa();

// 确保上传目录存在
ensureUploadDirs();

// 全局错误处理 — 兜底所有上游错误
app.use(errorHandler);

// ──────────────────────────────────────────────
// 全局状态注入
// ──────────────────────────────────────────────

app.use(async (ctx, next) => {
  ctx.state.config = config;
  const startTime = Date.now();
  await next();

  const endTime = Date.now();
  ctx.state.responseTime = endTime - startTime;
  ctx.set('X-Response-Time', ctx.state.responseTime.toString());
});

// ──────────────────────────────────────────────
// 中间件注册（顺序很重要）
// ──────────────────────────────────────────────

// 1. 请求 ID — 最先注册，确保所有后续逻辑都能获取 requestId
app.use(requestIdMiddleware);

// 2. 日志中间件
app.use(loggerMiddleware);

// 3. CORS — 跨域支持
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID"],
    maxAge: 86400,
  }),
);

// 4. Body 解析
app.use(
  bodyParser({
    enableTypes: ["json", "form"],
    jsonLimit: "50mb",
    formLimit: "10mb",
  }),
);

// 5. 静态资源服务（文件访问）
app.use(mount('/api/files', serve(UPLOAD_DIR)));

// 6. 路由
app.use(router.routes());

//当请求路径匹配到了，但 HTTP 方法不匹配时，返回 405 Method Not Allowed 并设置 Allow 响应头。
app.use(router.allowedMethods());


export default app;
