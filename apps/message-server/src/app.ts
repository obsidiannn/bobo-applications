import { createFactory } from "hono/factory";
import { prisma } from "@/lib/database";
import { HTTPException } from "hono/http-exception";
import { logger as loggerMiddleware } from "hono/logger";
import chat from '@/route/chat'
import message from '@/route/message'



BigInt.prototype.toJSON = function () {
  console.log('serialize');
  return Number.parseInt(this.toString());
};

export const factory = createFactory({
  initApp: async (app) => {
    await prisma.$connect();
    console.log('prisma connected')
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

app.use(loggerMiddleware());

app.route("/chats", chat);
app.route("/chats", message);

export default app;