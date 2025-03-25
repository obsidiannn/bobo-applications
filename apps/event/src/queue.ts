import 'dotenv/config';
import { eventQueue } from "@/lib/queues";
import { prisma } from "@/lib/database";
import { EventService } from '@/services/event.service';
import JsonBigInt from 'json-bigint';
import { protos } from "@repo/grpc/proto"
import { BotService } from './services/bot.service';
import { EventGroupApplyType } from './types/event';
const start = async () => {
    await prisma.$connect();
    eventQueue.process(async (job, done) => {
        const event = await EventService.findById(job.data.eventId);
        if (!event) {
            done();
            return;
        }
        try {
            await EventService.start(event.id);
            switch (event.type) {
                case protos.event.EventType.FRIEND_APPLY:
                    const fdata: { friendId: bigint, userId: bigint } = JsonBigInt.parse(event.data ?? "{}") as { friendId: bigint, userId: bigint };
                    await BotService.handleFriendApply(fdata.friendId, fdata.userId)
                    break;
                case protos.event.EventType.REGISTER:
                    const rdata: { userId: bigint } = JsonBigInt.parse(event.data ?? "{}") as { userId: bigint };
                    await BotService.handleRegister(rdata.userId)
                    break;
                case protos.event.EventType.GROUP_APPLY:
                    const gdata = JsonBigInt.parse(event.data ?? "{}") as EventGroupApplyType
                    await BotService.handleGroupApply(gdata.receiverId, gdata.userId, gdata.groupId)
                    break
                default:
                    break;
            }
            done();
        } catch (e: any) {
            await EventService.failed(event.id, e.message);
            done(new Error(e.message));
            return;
        }
    });
};
start().then(() => {
    console.log("[EventJob] started");
}).catch((e) => {
    console.error(e);
});