import { log } from "@/lib/system";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import JsonBigInt from 'json-bigint';
import search from '@/routes/search'

BigInt.prototype.toJSON = function () {
  return Number.parseInt(this.toString());
};

export const factory = createFactory({
  initApp: async (app) => {
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


app.use(async (c,next) => {
  console.log('do deserialize');
  await next()
  console.log('do serialize');
})
app.route("/discovery", search);
const port = process.env.PORT;
console.log(`Server is running on port ${port}`);
export default app;
