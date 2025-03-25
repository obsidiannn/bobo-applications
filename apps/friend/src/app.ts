import { prisma } from "@/lib/database";
import { log } from "@/lib/system";
import friend from "@/routes/friend";
import friendApply from "@/routes/friend-apply";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import JsonBigInt from 'json-bigint';

BigInt.prototype.toJSON = function () {
  console.log('serialize');
  
  return Number.parseInt(this.toString());
};

export const factory = createFactory({
  initApp: async (app) => {
    await prisma.$connect();
    app.onError((err: Error, c) => {
      log.error(
        JsonBigInt.stringify({
          msg: err.message,
          code: err.name,
        }),
      );
      log.debug(err);
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
// app.use(async (c, next) => {
//   await next();
//   console.log('do serialize');
//   const body = await c.res.json()
//   console.log('body=',body);
  
//   // 创建新的 Response 对象
//   c.res = new Response(body, {
//     status: c.res.status,
//     headers: {
//       'Content-Type': 'application/json',
//       ...c.res.headers
//     },
//   });
// });

app.use(async (c,next) => {
  console.log('do deserialize');
  await next()
  console.log('do serialize');
})
app.route("/friends", friend);
app.route("/friend-applies", friendApply);
const port = process.env.PORT;
console.log(`Server is running on port ${port}`);
export default app;
