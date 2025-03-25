import { serve } from "@hono/node-server";
import "dotenv/config";
import app from '@/app';
const port = process.env.PORT
serve({
  hostname: '0.0.0.0',
  fetch: app.fetch,
  port,
});

console.log(`Server is running on port ${port}`);