import { prisma } from '@/lib/database';
import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { pushMessage, sendSocket } from './notify.grpc';
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
        this.grpcServer.addService(protos.notify.NotifyProtoService, {
            pushMessage,
            sendSocket
        });
        this.grpcServer.bindAsync(this.addr, grpc.ServerCredentials.createInsecure(), (error, port) => {
            console.log(`notify server start at ${port}`);
            if (error) {
                log.error(error);
                return;
            }
            log.info(`Server running at http://0.0.0.0:${port}`);
            process.on('SIGINT', async () => {
                console.log('Received SIGINT. Shutting down gracefully...');
                await prisma.$disconnect();
                this.grpcServer.forceShutdown();
                process.exit(0);
            });
        });
    }
    async stop() {
        await prisma.$disconnect();
        this.grpcServer.forceShutdown();
    }
}