import { createFactory } from "hono/factory";
import { prisma } from "@/lib/database";
import { HTTPException } from "hono/http-exception";
import { logger as loggerMiddleware } from "hono/logger";

import group from "@/routes/group";
import groupAction from "@/routes/group-action";
import groupAdmin from "@/routes/group-admin";
import groupInvitation from "@/routes/group-invitation";
import groupMember from "@/routes/group-member";


BigInt.prototype.toJSON = function () {
  return Number.parseInt(this.toString());
};

export const factory = createFactory({
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

const port = process.env.PORT;
console.log(`Server is running on port ${port}`);
const app = factory.createApp();

app.use(loggerMiddleware());
// app.use(middleware.cryptoMiddleware(log,wallet));
// app.use(middleware.requestLoggerMiddleware(log));

app.route("/groups", group);
app.route("/groups", groupAction);
app.route("/groups", groupAdmin);
app.route("/groups", groupInvitation);
app.route("/groups", groupMember);

export default app;