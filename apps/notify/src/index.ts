import { serve } from "@hono/node-server";
import "dotenv/config";
import app from '@/app';
import { Server } from 'socket.io';
import { initRedis } from '@/services/redis';
import socketService from '@/services/socket'
const port = process.env.PORT
const server = serve({
  hostname: '0.0.0.0',
  fetch: app.fetch,
  port,
});

export const sessionMap = new Map<string, string>()
export const io: Server = new Server(server, {
  pingInterval: 30000,
  pingTimeout: 60000,
  path: '/ws'
})

initRedis()
socketService.init()
initRedis()
console.log(`Server is running on port ${port}`);