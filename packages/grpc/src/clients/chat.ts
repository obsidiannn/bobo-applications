import { ChannelCredentials } from '@grpc/grpc-js';
import { protos } from '../generated';
import { v7 as uuidv7 } from 'uuid';
export class ChatProtoClient {
    private addr: string;
    private client: protos.chat.ChatProtoClient;
    constructor(addr: string) {
        this.addr = addr;
        this.client = new protos.chat.ChatProtoClient(this.addr, ChannelCredentials.createInsecure());
    }
    async findByIds(ids: string[]): Promise<protos.chat.Chat[]> {
        return new Promise((resolve, reject) => {
            this.client.findByIds({
                ids,
            }, (error, resp) => {
                if (error) {
                    reject({
                        success: 400,
                        error: error.message
                    });
                } else {
                    resolve(resp.chats);
                }
            })
        })
    }
    async addUsers(id: string, userIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.addUsers({
                id,
                userIds: userIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async removeUsers(id: string, userIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.removeUsers({
                id,
                userIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async changeCreator(id: string, creatorId: bigint): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.changeCreator({
                id,
                creatorId
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async create(creatorId: bigint, businessType: number, userIds: bigint[]): Promise<protos.chat.Chat> {
        return new Promise((resolve, reject) => {
            this.client.create({
                creatorId,
                businessType,
                userIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(resp);
                }
            })
        });
    }
    async exitByIds(ids: string[], userIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.exitByIds({
                ids,
                userIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async dropByIds(ids: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.dropByIds({
                ids,
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            })
        })
    }
    async sendUserMessage(id: string, userId: bigint, type: protos.chat.MessageType, content: string, receiverUserIds: bigint[] = []): Promise<protos.chat.Message> {
        return new Promise((resolve, reject) => {
            this.client.sendUserMessage({
                id,
                type,
                msgId: uuidv7().toString(),
                userId,
                content,
                receiverUserIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(resp);
                }
            });
        });
    }
    async sendBotMessage(id: string, senderId: bigint, type: protos.chat.MessageType, content: string): Promise<protos.chat.Message> {
        return new Promise((resolve, reject) => {
            this.client.sendBotMessage({
                id,
                senderId,
                type,
                content,
                msgId: uuidv7().toString(),
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(resp);
                }
            });
        });
    }
    async clearMessageByIds(ids: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.clearMessageByIds({
                ids,
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            });
        });
    }
    async clearMessageByUserIds(userIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.clearMessageByUserIds({
                userIds,
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            });
        });
    }
    async removeUserByIds(userId: bigint, ids: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.removeUserByIds({
                userId,
                ids,
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            });
        });
    }
    async removeUserByUserIds(userIds: bigint[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.removeUserByUserIds({
                userIds
            }, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(!!resp);
                }
            });
        });
    }

    async changeChatConfig(param: protos.chat.ChatConfigRequest): Promise<protos.chat.ChatConfigResponse> {
        return new Promise((resolve, reject) => {
            this.client.changeChatConfig(param, (error, resp) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(resp);
                }
            });
        });
    }
}