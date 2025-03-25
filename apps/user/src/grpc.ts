import "dotenv/config"
import { GrpcServer } from "@/grpc/server";
BigInt.prototype.toJSON = function () {
  return Number.parseInt(this.toString());
};
const grpcServer = new GrpcServer(process.env.GRPC_ADDR);
grpcServer.server().catch(err => {
    console.log(err)
  })