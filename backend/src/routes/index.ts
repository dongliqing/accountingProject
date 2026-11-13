import Router from '@koa/router';
import userRouter from './user.route';
import authRouter from './auth.route';
import uploadRouter from './upload.route';
import logger from '../utils/logger';

const router = new Router();

// ── 健康检查 ─────────────────────────────────

/** 轻量级探针 — 不依赖数据库 */
router.get('/api/health', (ctx) => {
  ctx.body = {
    success: true,
    code: 0,
    message: 'ok',
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV ?? 'development',
    },
    requestId: ctx.state.requestId,
  };
});

/** 深度健康检查 — 验证数据库连接 */
router.get('/api/health/deep', async (ctx) => {
  try {
    const { default: prisma } = await import('../services/prisma');
    await prisma.$queryRaw`SELECT 1`;
    ctx.body = {
      success: true,
      code: 0,
      message: 'All systems operational',
      data: { database: 'connected' },
      requestId: ctx.state.requestId,
    };
  } catch (err: any) {
    logger.error('深度健康检查失败', { requestId: ctx.state.requestId, error: err });
    ctx.status = 503;
    ctx.body = {
      success: false,
      code: 50300,
      message: 'Service degraded',
      data: { database: 'disconnected', error: err.message },
      requestId: ctx.state.requestId,
    };
  }
});

// ── 注册业务路由 ─────────────────────────────
router.use(authRouter.routes());
router.use(uploadRouter.routes());
router.use(userRouter.routes());

export default router;
