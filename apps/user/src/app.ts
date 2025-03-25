import { createFactory } from "hono/factory";
import { prisma } from "@/lib/database";
import { HTTPException } from "hono/http-exception";
import auth from "@/routes/auth";
import user from "@/routes/user";
import { logger } from "hono/logger";
import { log } from "@/lib/system";
import noAuth from "@/routes/no-auth";
import "dotenv/config"

BigInt.prototype.toJSON = function () {
  return Number.parseInt(this.toString());
};
const factory = createFactory({
  initApp: async (app) => {
    app.use(logger());
    await prisma.$connect();
    app.onError((err: Error, c) => {
      log.error(JSON.stringify(err));
      if (err instanceof HTTPException) {
        return c.json({
          code: err.status,
          message: err.message,
          data: null,
        },err.status);
      }
      return c.json({
        code: 500,
        message: err.message,
        data: null,
      });
    });
  },
});
const app = factory.createApp();
app.route("/auth", auth);
app.route("/auth", noAuth);
app.route("/users", user);

export default app;