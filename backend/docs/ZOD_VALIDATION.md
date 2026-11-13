# Zod 验证优化文档

## 📋 优化概述

本次优化为后端引入了 **Zod** 类型验证库，替代了原有的手动类型断言和参数检查，实现了：

1. ✅ **类型安全** - 编译时 + 运行时双重保障
2. ✅ **代码简洁** - 减少重复的验证代码
3. ✅ **错误友好** - 更清晰的错误提示
4. ✅ **统一规范** - 所有接口使用一致的验证方式

---

## 🏗️ 架构变更

### 新增文件

```
src/
├── validators/
│   └── index.ts          # Zod schema 定义
└── middleware/
    └── validate.ts       # 通用验证中间件
```

### 修改文件

```
src/
├── controllers/
│   ├── auth.controller.ts       # 登录接口
│   └── user.controller.ts       # 用户接口
└── routes/
    ├── auth.route.ts            # 添加验证中间件
    └── user.route.ts            # 添加验证中间件
```

---

## 📖 使用方法

### 1. 定义 Schema

在 `src/validators/index.ts` 中定义验证规则：

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
```

### 2. 在路由中使用验证中间件

```typescript
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators";

router.post("/login", validate(loginSchema), login);
```

### 3. 在控制器中获取验证后的数据

```typescript
export async function login(ctx: Context) {
  // 从 ctx.state.validated.body 获取验证后的数据
  const { username, password } = ctx.state.validated.body as LoginSchemaType;
  
  // 直接使用，无需再次验证
  const user = await prisma.user.findUnique({ where: { username } });
  // ...
}
```

---

## 🎯 验证中间件说明

### `validate(schema, source?)`

**参数：**
- `schema` - Zod schema 验证规则
- `source` - 数据来源，可选值：`'body'` | `'query'` | `'params'`，默认 `'body'`

**示例：**

```typescript
// 验证请求体 (默认)
router.post("/login", validate(loginSchema), login);

// 验证查询参数
router.get("/", validate(paginationSchema, "query"), getUsers);

// 验证路径参数 (如果需要)
router.get("/:id", validate(userIdSchema, "params"), getUserById);
```

---

## 📋 已优化的接口

### 1. 登录接口 (`POST /api/auth/login`)

**Schema:** `loginSchema`

```typescript
{
  username: string;  // 必填
  password: string;  // 必填
}
```

**错误示例：**
```json
{
  "success": false,
  "code": 40000,
  "message": "参数验证失败: username: 用户名不能为空, password: 密码不能为空"
}
```

---

### 2. 用户列表接口 (`GET /api/users`)

**Schema:** `paginationSchema`

```typescript
{
  page?: number;      // 可选，默认 1，正整数
  pageSize?: number;  // 可选，默认 20，正整数，最大 100
}
```

---

### 3. 创建用户接口 (`POST /api/users`)

**Schema:** `createUserSchema`

```typescript
{
  email: string;         // 必填，必须是有效邮箱
  username: string;      // 必填
  passwordHash?: string; // 可选
  avatar?: string;       // 可选，必须是有效 URL
  phone?: string;        // 可选，必须符合中国手机号格式
}
```

---

## 🔍 优势对比

### ❌ 优化前（手动验证）

```typescript
const body = ctx.request.body as any;
const { username, password } = body;

if (!username || typeof username !== 'string') {
  throw new BadRequestError('用户名是必填字段');
}

if (!password || typeof password !== 'string') {
  throw new BadRequestError('密码是必填字段');
}

// 类型不安全，需要手动检查每个字段
const user = await prisma.user.findUnique({ 
  where: { username: username as string } 
});
```

### ✅ 优化后（Zod 验证）

```typescript
// 路由中
router.post("/login", validate(loginSchema), login);

// 控制器中
const { username, password } = ctx.state.validated.body as LoginSchemaType;

// 直接使用，类型安全
const user = await prisma.user.findUnique({ where: { username } });
```

---

## 🧪 测试验证

### 正常请求

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
}
```

**响应：**
```json
{
  "success": true,
  "code": 0,
  "message": "登录成功",
  "data": { ... }
}
```

### 参数错误请求

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "",
  "password": ""
}
```

**响应：**
```json
{
  "success": false,
  "code": 40000,
  "message": "参数验证失败: username: 用户名不能为空, password: 密码不能为空"
}
```

---

## 📚 常用 Zod 验证规则

```typescript
// 字符串
z.string()                    // 任意字符串
z.string().min(1)             // 非空字符串
z.string().email()            // 邮箱
z.string().url()              // URL
z.string().uuid()             // UUID
z.string().regex(/^1\d{10}$/) // 正则

// 数字
z.number()                    // 任意数字
z.number().int()              // 整数
z.number().positive()         // 正数
z.number().max(100)           // 最大值 100

// 枚举
z.enum(['standard', 'hd'])    // 枚举值

// 可选和默认值
z.string().optional()         // 可选
z.string().default('value')   // 默认值

// 类型推断
type MyType = z.infer<typeof mySchema>;
```

---

## 🚀 下一步计划

1. ✅ 为所有接口添加 Zod 验证（已完成）
2. ⏳ 添加更多自定义验证规则（如：图片尺寸格式）
3. ⏳ 统一错误响应格式
4. ⏳ 添加 Swagger/OpenAPI 文档自动生成
5. ⏳ 添加更多单元测试

---

## 📝 注意事项

1. **类型安全** - 始终使用 `z.infer<typeof schema>` 获取类型
2. **错误处理** - Zod 错误会被自动捕获并转换为友好的错误消息
3. **性能** - Zod 验证性能优秀，无需担心性能问题
4. **扩展性** - 新增接口时，优先定义 Schema，再编写控制器逻辑

---

## 🔗 参考文档

- [Zod 官方文档](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
