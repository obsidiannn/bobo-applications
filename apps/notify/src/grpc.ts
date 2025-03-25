import "dotenv/config"
import { GrpcServer } from "@/grpc/server";
import { prisma } from '@/lib/database';
import { initRedis } from "./services/redis";
const grpcServer = new GrpcServer(process.env.GRPC_ADDR);
await prisma.$connect();
initRedis()
grpcServer.server().catch(err => {
  console.log(err)
})