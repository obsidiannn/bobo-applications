import { prisma } from '@/lib/database';
import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { findUsersByAddrs, findUsersByIds } from './user.grpc';
import { log } from '@/lib/system';
export class GrpcServer {
    private grpcServer: grpc.Server;
    private addr: string;
    constructor(addr: string) {
        this.grpcServer = new grpc.Server();
        this.addr = addr;
    }
    async server() {
        await prisma.$connect();
        this.grpcServer.addService(protos.user.UserProtoService, {
            findUsersByAddrs,
            findUsersByIds,
        });
        this.grpcServer.bindAsync(this.addr, grpc.ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                log.error(error);
                return;
            }
            console.log(`grpc Server running at http://0.0.0.0:${port}`);
            log.info(`grpc Server running at http://0.0.0.0:${port}`);
            process.on('SIGINT', async () => {
                console.log('Received SIGINT. Shutting down gracefully...');
                await prisma.$disconnect();
                this.grpcServer.forceShutdown();
                process.exit(0);
            });
        });
    }

}