
import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
export class UserProtoClient {
    private addr: string;
    private client: protos.user.UserProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.user.UserProtoClient(
            this.addr,
            ChannelCredentials.createInsecure(),
        );
    }
    async findUsersByIds(ids: bigint[]): Promise<protos.user.User[]> {
        return new Promise((resolve, reject) => {
            this.client.findUsersByIds({ ids }, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response.users);
                }
            })
        })
    }
    async findUsersByAddrs(addrs: string[]): Promise<protos.user.User[]> {
        console.error("client findUsersByAddrs", addrs);
        return new Promise((resolve, reject) => {
            this.client.findUsersByAddrs({ addrs }, (error, response) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(response.users);
                }
            })
        })
    }
}