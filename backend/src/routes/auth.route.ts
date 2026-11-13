import Router from "@koa/router";
import { login } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators";

const router = new Router({ prefix: "/api/auth" });

/** POST /api/auth/login — 用户登录 */
router.post("/login", validate(loginSchema), login);

export default router;
