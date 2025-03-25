import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
import JsonBigInt from 'json-bigint';
export class EventProtoClient {
    private addr: string;
    private client: protos.event.EventProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.event.EventProtoClient(this.addr, ChannelCredentials.createInsecure());
    }
    async broadcast(type: protos.event.EventType, data: unknown): Promise<protos.event.Event> {
        return new Promise((resolve, reject) => {
            this.client.broadcast({
                type,
                data: JsonBigInt.stringify(data)
            }, (error, resp) => {
                if (error) {
                    reject({
                        success: 400,
                        error: error.message
                    });
                } else {
                    resolve(resp);
                }
            })
        })
    }
}