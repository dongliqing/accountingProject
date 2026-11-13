import Router from "@koa/router";
import {
  getUsers,
  getUserById,
  createUser,
} from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import { createUserSchema, paginationSchema } from "../validators";

const router = new Router({ prefix: "/api/users" });

/** GET /api/users — 用户列表 (分页) */
router.get("/", authMiddleware, validate(paginationSchema, "query"), getUsers);

/** GET /api/users/:id — 获取单个用户详情 */
router.get("/:id", authMiddleware, getUserById);

/** POST /api/users — 创建用户 */
router.post("/", authMiddleware, validate(createUserSchema), createUser);

export default router;
