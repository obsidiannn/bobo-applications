import "dotenv/config";
import { createFactory } from "hono/factory";
import { prisma } from "@/lib/database";
import { HTTPException } from "hono/http-exception";
import system from "@/routes/system";
import s3 from "@/routes/s3";
import { logger } from "hono/logger";

const factory = createFactory({
  initApp: async (app) => {
    await prisma.$connect();
    app.onError((err: Error, c) => {
      if (err instanceof HTTPException) {
        return c.json({
          code: err.status,
          message: err.message,
          data: null,
        });
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

app.use(logger());
app.route("/sys", system);
app.route("/sys", s3);
const port = process.env.PORT;
console.log(`Server is running on port ${port}`);

export default app;