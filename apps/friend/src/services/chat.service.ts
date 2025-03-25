import { IModel } from "@repo/enums";
import { chat as chatGrpc, user } from "@repo/grpc/client"
import { protos } from "../../../../packages/grpc/dist/generated";
export class ChatService {
    private static instance: ChatService;
    private protoClient: chatGrpc.ChatProtoClient;
    constructor(protoClient: chatGrpc.ChatProtoClient) {
        this.protoClient = protoClient;
    }
    private static async make() {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService(new chatGrpc.ChatProtoClient(process.env.CHAT_GRPC_ADDR));
        }
        return ChatService.instance;
    }
    static async create(userId: bigint, friendId: bigint) {
        const instance = await ChatService.make();
        return await instance.protoClient.create(userId, IModel.IChat.IChatTypeEnum.NORMAL, [userId, friendId]);
    }
    static async dropById(id: string) {
        return await ChatService.dropByIds([id])
    }
    static async dropByIds(ids: string[]) {
        const instance = await ChatService.make();
        return await instance.protoClient.dropByIds(ids);
    }
    static async removeUserById(userId: bigint, id: string) {
        return await ChatService.removeUserByIds(userId, [id]);
    }
    static async removeUserByIds(userId: bigint, ids: string[]) {
        const instance = await ChatService.make();
        return await instance.protoClient.removeUserByIds(userId, ids);
    }
    static async removeUserByUserIds(userIds: bigint[]) {
        const instance = await ChatService.make();
        return await instance.protoClient.removeUserByUserIds(userIds);
    }
    static async removeUserByUserId(userId: bigint) {
        return await ChatService.removeUserByUserIds([userId]);
    }

    static async block(userId: bigint, chatId: string): Promise<protos.chat.ChatConfigResponse> {
        const instance = await ChatService.make();
        return await instance.protoClient.changeChatConfig({
            id: chatId,
            userId,
            changeField: 'isShow',
            value: String(IModel.ICommon.ICommonBoolEnum.NO)
        });
    }

    static async blockOut(userId: bigint, chatId: string): Promise<protos.chat.ChatConfigResponse> {
        const instance = await ChatService.make();
        return await instance.protoClient.changeChatConfig({
            id: chatId,
            userId,
            changeField: 'isShow',
            value: String(IModel.ICommon.ICommonBoolEnum.YES)
        });
    }

}