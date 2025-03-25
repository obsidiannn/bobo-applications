import { expect, test, describe, afterAll, beforeAll } from "@jest/globals";
import "dotenv/config";
import { GrpcServer } from "@/grpc/server";
import { prisma } from "@/lib/database";
import { user } from "@repo/grpc/client";
const grpcServer = new GrpcServer(process.env.GRPC_ADDR);

describe("grpc Test", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await grpcServer.server();
  });
  afterAll(() => {
    // grpcServer.stop();
  });
  test("findUsersByAddrs", async () => {
    const client = new user.UserProtoClient(process.env.GRPC_ADDR);
    const items = await client.findUsersByAddrs(["0x1"]);
    expect(items.length).toBe(items.length);
  })
  test("findUsersByIds", async () => {
    const client = new user.UserProtoClient(process.env.GRPC_ADDR);
    const items = await client.findUsersByIds([1n,2n]);
    expect(items.length).toBe(items.length);
  })
});
