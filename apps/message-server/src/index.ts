import "dotenv/config"
import { serve } from "@hono/node-server";
import app from '@/app';

BigInt.prototype.toJSON = function () {
  return Number.parseInt(this.toString());
};
serve({
  fetch: app.fetch,
  port: process.env.PORT
}, (addr) => {
  console.log('server start at port:' + addr.port)
});


