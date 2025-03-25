import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
export interface ICallback  {
  (addr: string): Promise<any>;
}
export default (callback: ICallback) => {
  return createMiddleware(async (c: Context, next: Next) => {
    
    const addr = c.req.header('x-req-addr');
    if (!addr) {
      throw new HTTPException(400, { message: "addr is empty" });
    }
  
    const user = await callback(addr);
    if (!user || user.status != 1) {
      throw new HTTPException(401, { message: "未注册的用户" });
    }
    c.set("user", user);
    await next();
  })
}