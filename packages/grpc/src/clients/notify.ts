import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
import JsonBigInt from 'json-bigint';
export class NotifyProtoClient {
    private addr: string;
    private client: protos.notify.NotifyProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.notify.NotifyProtoClient(this.addr, ChannelCredentials.createInsecure());
    }
    async pushMessage(topics: string[], userIds: bigint[], title: string, body: string, data: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.pushMessage({
                topics,
                userIds,
                title,
                body,
                data: JsonBigInt.stringify(data)
            }, (error, resp) => {
                if (error) {
                    reject({
                        success: 400,
                        error: error.message
                    });
                } else {
                    resolve(!!resp);
                }
            })
        })
    }

    /**
     * 发送socket 推送
     * @param type 
     * @param channel 
     * @param sequence 
     * @param senderId 
     * @param dateMills 
     * @param metadata 
     * @param recieverIds 
     * @returns 
     */
    async sendSocket(
        param: protos.notify.SocketEventRequest
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.sendSocket(param, (error, resp) => {
                if (error) {
                    reject({
                        success: 400,
                        error: error.message
                    });
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
}