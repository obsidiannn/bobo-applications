import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { EventService } from '@/services/event.service';
import { eventQueue } from '@/lib/queues';
import { IModel } from '@repo/enums';
export const broadcast = async (call: grpc.ServerUnaryCall<protos.event.BroadcastRequest, boolean>, callback: grpc.sendUnaryData<boolean>) => {
    const request = call.request;
    const event = await EventService.create({
        type: request.type,
        data: request.data,
        status: IModel.IEvent.Status.PENDING,
    });
    await eventQueue.add({
        eventId: Number(event.id)
    });
    callback(null, true);
};