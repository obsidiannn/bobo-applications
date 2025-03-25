import { Context, Hono } from "hono";
import { AuthService } from "@/services/auth.service";
const noAuth = new Hono();

noAuth.all("/signup", async (c: Context) => {
  const addr = c.req.header("x-req-addr") as string;
  const pubKey = c.req.header("x-req-pub-key") ?? "";
  console.log("请求地址：", addr);
  console.log("pubKey", pubKey);
  const user = await AuthService.signUp(addr, pubKey)
  console.log("user", user);
  return c.json({
    user: {
      id: Number(user.id),
      nickName: user.nickName,
      userName: user.userName,
      gender: user.gender,
      addr: user.addr,
      pubKey:user.pubKey,
      avatar: user.avatar,
      nickNameIdx: user.nickNameIdx,
      sign: user.sign,
      createdAt: user.createdAt,
    }
  });
});
export default noAuth;
