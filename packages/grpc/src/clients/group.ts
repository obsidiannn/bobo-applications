import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
export class GroupProtoClient {
    private addr: string;
    private client: protos.group.GroupProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.group.GroupProtoClient(
            this.addr,
            ChannelCredentials.createInsecure(),
        );
    }
    async findGroupByIds(ids: bigint[]): Promise<protos.group.Group[]> {
        return new Promise((resolve, reject) => {
            this.client.findGroupByIds({ ids }, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response.items);
                }
            })
        })
    }

}