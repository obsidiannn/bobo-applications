import { bot as botGrpc } from "@repo/grpc/client"
import { protos } from "@repo/grpc/proto";
import JsonBigInt from "json-bigint";
import { UserService } from "./user.service";
export class BotService {
    private static instance: BotService;
    private protoClient: botGrpc.BotProtoClient;
    constructor(protoClient: botGrpc.BotProtoClient) {
        this.protoClient = protoClient;
    }
    private static async make() {
        if (!BotService.instance) {
            BotService.instance = new BotService(new botGrpc.BotProtoClient(process.env.USER_GRPC_ADDR));
        }
        return BotService.instance;
    }
    static async createChat(botId: bigint, userId: bigint) {
        const instance = await BotService.make();
        return instance.protoClient.createChat(botId, userId);
    }
    static async sendMessage(botId: bigint, userId: bigint, type: protos.chat.MessageType, content: unknown) {
        const instance = await BotService.make();
        return await instance.protoClient.sendMessageByUserIds(botId, JsonBigInt.stringify(content), [userId]);
    }
    static async handleRegister(userId: bigint) {
        const notifyBotId = BigInt(process.env.NOTIFY_BOT_ID);
        const message = {
            text: "欢迎注册 bobo chat"
        }
        await BotService.sendMessage(notifyBotId, userId, protos.chat.MessageType.TEXT, message);
    }
    static async handleFriendApply(recieverId: bigint, userId: bigint) {
        const notifyBotId = BigInt(process.env.NOTIFY_BOT_ID);
        const user = await UserService.findById(userId)
        const message = {
            text: (user?.nickName ?? '用户') + "添加你为好友",
            link: "https://bo.app/friendApply/info?userId=" + userId
        }
        await BotService.sendMessage(notifyBotId, recieverId, protos.chat.MessageType.LINK, message);
    }

    static async handleGroupApply(recieverId: bigint, userId: bigint, groupId: bigint) {
        const notifyBotId = BigInt(process.env.NOTIFY_BOT_ID);
        const user = await UserService.findById(userId)
        const message = {
            text: (user?.nickName ?? '用户') + "申请加入群组",
            link: "https://bo.app/groupApply/info?groupId=" + groupId + '&userId=' + userId
        }
        await BotService.sendMessage(notifyBotId, recieverId, protos.chat.MessageType.LINK, message);
    }
}