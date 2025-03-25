import "dotenv/config"
import { serve } from "@hono/node-server";
import app from '@/app';
const port = process.env.PORT;
serve({
  fetch: app.fetch,
  port,
});
