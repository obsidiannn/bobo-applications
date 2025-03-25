import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import { PushJobService } from '@/services/push-job.service';
import JsonBigInt from 'json-bigint';
import { pushQueue } from '@/lib/queues';
import { IModel } from '@repo/enums';
import { SenderService } from '@/services/sender.service';
export const pushMessage = async (call: grpc.ServerUnaryCall<protos.notify.PushRequest, boolean>, callback: grpc.sendUnaryData<boolean>) => {
    const request = call.request;

    const job = await PushJobService.create({
        topics: JsonBigInt.stringify(request.topics),
        userIds: JsonBigInt.stringify(request.userIds),
        title: request.title,
        status: IModel.IPushJob.Status.PENDING,
        body: request.body,
        data: request.data,
    });
    await pushQueue.add({
        jobId: Number(job.id)
    });
    callback(null, true);
};

/**
 * 发送websocket 消息 
 * @param call 
 * @param callback 
 */
export const sendSocket = async (call: grpc.ServerUnaryCall<protos.notify.SocketEventRequest, boolean>, callback: grpc.sendUnaryData<boolean>) => {
    const request = call.request;
    console.log('send socket');
    
    const senderService = SenderService.getInstance()
    senderService.publishMessageTopic(request)
    callback(null, true);
};
