import app from './app';
import { config } from './config';
import logger from './utils/logger';

// ──────────────────────────────────────────────
// Server 启动
// ──────────────────────────────────────────────

const server = app.listen(config.port, () => {
  logger.info('多账单记账助手 — Backend 启动成功', {
    environment: config.nodeEnv,
    port: config.port,
    databaseUrl: config.databaseUrl.replace(/\/\/.*@/, '//***@'),
  });
  
  // 也保留原有的美观控制台输出
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║    🚀 多账单记账助手 — Backend              ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`  📍 Environment : ${config.nodeEnv}`);
  console.log(`  📍 Port        : ${config.port}`);
  console.log(`  📍 Database    : ${config.databaseUrl.replace(/\/\/.*@/, '//***@')}`);
  console.log('');
  console.log('  ── Endpoints ──────────────────────────────');
  console.log('  GET  /api/health');
  console.log('  GET  /api/health/deep');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/users');
  console.log('  GET  /api/users/:id');
  console.log('  POST /api/users');
  console.log('  POST /api/upload/image');
  console.log('  POST /api/upload/images');
  console.log('  GET  /api/upload/file/:fileId');
  console.log('  GET  /api/upload/download/:fileId');
  console.log('  ───────────────────────────────────────────');
  console.log('');
});

// ──────────────────────────────────────────────
// 优雅关闭
// ──────────────────────────────────────────────

async function gracefulShutdown(signal: string) {
  logger.info(`收到关闭信号，正在优雅关闭...`, { signal });

  // 停止接受新连接
  server.close(() => {
    logger.info('HTTP 服务已关闭');
  });

  // 关闭数据库连接
  const { default: prisma } = require('./services/prisma');
  prisma.$disconnect().then(() => {
    logger.info('数据库连接已关闭');
    process.exit(0); // 正常退出
  });

  // 超时兜底: 10s 后强制退出
  setTimeout(() => {
    logger.error('关闭超时，强制退出');
    process.exit(1); // 退出码 1 表示异常退出
  }, 10_000).unref(); 
}

//进程级异常处理与优雅关闭机制，用于确保服务在各种异常场景下都能安全、可控地运行。
//操作系统或容器编排工具（如 Docker、Kubernetes）发送的终止信号，常见于部署更新、缩容等场景。
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//用户在终端按 Ctrl+C 时发出的中断信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

//捕获所有未被 .catch() 或 try/catch 处理的 Promise 异常。
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason, stack: reason?.stack });
});

//捕获所有未被 try/catch 包裹的同步异常。这类异常意味着程序已经处于不可预测的状态，继续运行可能导致数据损坏或更严重的问题，因此记录日志后立即退出进程（退出码 1 表示异常退出）。
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error, stack: error.stack });
  process.exit(1);
});
