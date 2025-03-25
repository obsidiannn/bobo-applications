import { chat as chatGrpc } from "@repo/grpc/client"
import { protos } from "@repo/grpc/proto";
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
    static async sendBotMessage(id: string, botId: bigint, type: protos.chat.MessageType, content: string) {
        const instance = await ChatService.make();
        return await instance.protoClient.sendBotMessage(id, botId, type, content);
    }
}