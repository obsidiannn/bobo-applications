import { event as eventGrpc } from "@repo/grpc/client"
import { protos } from "@repo/grpc/proto"
import { FriendApply } from "@prisma/db-friend"
export class EventService {
    private static instance: EventService;
    private protoClient: eventGrpc.EventProtoClient;
    constructor(protoClient: eventGrpc.EventProtoClient) {
        this.protoClient = protoClient;
    }
    private static async make() {
        if (!EventService.instance) {
            EventService.instance = new EventService(new eventGrpc.EventProtoClient(process.env.EVENT_GRPC_ADDR));
        }
        return EventService.instance;
    }
    static async broadcastFriendApply(item: FriendApply) {
        const instance = await EventService.make();
        return await instance.protoClient.broadcast(protos.event.EventType.FRIEND_APPLY, {
            friendApply: item,
        });
    }
}