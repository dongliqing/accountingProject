import { Context, Next } from 'koa';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from './error.handler';

/**
 * 通用验证中间件工厂函数
 * @param schema - Zod schema 验证规则
 * @param source - 数据来源：'body' | 'query' | 'params'
 */
export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (ctx: Context, next: Next) => {
    try {
      const data =
        source === 'body'
          ? ctx.request.body
          : source === 'query'
          ? ctx.query
          : ctx.params;

      // 解析并验证数据
      const validated = schema.parse(data);

      // 将验证后的数据挂载到 ctx.state 供后续使用
      ctx.state.validated = {
        ...ctx.state.validated,
        [source]: validated,
      };

      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 格式化 Zod 错误信息
        const errors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        
        throw new BadRequestError(
          `参数验证失败: ${errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ')}`
        );
      }
      throw error;
    }
  };
}
