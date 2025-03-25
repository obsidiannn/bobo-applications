import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated'
export class BotProtoClient {
    private addr: string;
    private client: protos.bot.BotProtoClient
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.bot.BotProtoClient(this.addr, ChannelCredentials.createInsecure());
    }
    async createChat(botId: bigint, userId: bigint): Promise<protos.chat.Chat> {
        return new Promise((resolve, reject) => {
            this.client.createChat({
                botId: botId,
                userId: userId
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
    async dropChat(botId: bigint, userId: bigint): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.dropChat({
                botId: botId,
                userId: userId
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async sendMessageByBotIds(botIds: bigint[], content: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.sendMessageByBotIds({
                botIds: botIds,
                content,
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async sendMessageByUserIds(botId: bigint,content:string, receiverUserIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.sendMessageByUserIds({
                botId: botId,
                content,
                receiverUserIds: receiverUserIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
}