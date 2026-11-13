import winston from 'winston';
import { config } from '../config';

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境决定日志级别
const level = () => {
  const env = config.nodeEnv || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// 自定义颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// 格式化日志
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.errors({ stack: true }), // 记录错误堆栈
);

// 控制台输出格式化
const consoleFormat = winston.format.combine(
  format,
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    let logMessage = `${info.timestamp} [${info.level}]: ${info.message}`;
    // 添加错误堆栈
    if (info.stack) {
      logMessage += `\n${info.stack}`;
    }
    // 添加元数据
    const metadata = info.metadata as Record<string, unknown> | undefined;
    if (metadata && Object.keys(metadata).length > 0) {
      logMessage += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return logMessage;
  })
);

// 文件输出格式化
const fileFormat = winston.format.combine(
  format,
  winston.format.json()
);

// 日志传输目标
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: 'logs/all.log',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// 创建日志实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
  exitOnError: false,
});

export default logger;
