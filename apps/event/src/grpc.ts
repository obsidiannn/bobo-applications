import "dotenv/config"
import { GrpcServer } from "@/grpc/server";
const grpcServer = new GrpcServer(process.env.GRPC_ADDR);
grpcServer.server().catch(err => {
    console.log("grpc server error")
    console.log(err)
  })