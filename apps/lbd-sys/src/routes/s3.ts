import { Hono } from "hono";
import Crypto from "crypto";
import s3 from "@/lib/s3";
const app = new Hono();

app.post("/s3/getUploadPreSignUrl", async (c) => {
    const key = "tmp/" + Crypto.randomUUID();
    const result = await s3.uploadPreSign(key);
    return c.json({
        uploadUrl: result,
        key
    })
});
export default app;