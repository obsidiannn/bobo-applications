
import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
export class SearchProtoClient {
    private addr: string;
    private client: protos.search.SearchProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.search.SearchProtoClient(
            this.addr,
            ChannelCredentials.createInsecure(),
        );
    }
    async dropIndex(req: protos.search.DropIndexRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.dropIndex(req, (error, response) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(response ?? false);
                }
            })
        })
    }
    async makeIndex(req: protos.search.SearchIndexRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.makeIndex(req, (error, response) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(response ?? false);
                }
            })
        })
    }
}