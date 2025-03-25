import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { log } from '@/lib/system';
import { SearchService } from '@/services/search.service';
export class GrpcServer {
    private grpcServer: grpc.Server;
    private addr: string;
    constructor(addr: string) {
        this.grpcServer = new grpc.Server();
        this.addr = addr;
    }
    async server() {
        this.grpcServer.addService(protos.search.SearchProtoService, {
            makeIndex,
            dropIndex
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
                this.grpcServer.forceShutdown();
                process.exit(0);
            });
        });
    }

}

export const makeIndex = async (call: grpc.ServerUnaryCall<protos.search.SearchIndexRequest, boolean>,
    callback: grpc.sendUnaryData<boolean>) => {
    const request = call.request;
    const service = SearchService.getInstance()
    const result = await service.createIndex(request)
    callback(null, result);
}

export const dropIndex = async (call: grpc.ServerUnaryCall<protos.search.DropIndexRequest, boolean>,
    callback: grpc.sendUnaryData<boolean>) => {
    const request = call.request;
    const service = SearchService.getInstance()
    const result = await service.deleteIdx(request)
    callback(null, result);
}
