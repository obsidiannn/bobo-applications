import 'dotenv/config';
import { pushQueue } from "@/lib/queues";
import { prisma } from "@/lib/database";
import { PushJobService } from '@/services/push-job.service';
import JsonBigInt from 'json-bigint';
import { FirebaseService } from '@/services/firebase.service';
import { UserFirebaseTokenService } from '@/services/user-firebase-token.service';
const start = async () => {
    await prisma.$connect();
    pushQueue.process(async (job, done) => {
        const pushJob = await PushJobService.findById(job.data.jobId);
        if (!pushJob) {
            done();
            return;
        }
        try {
            await PushJobService.start(pushJob.id);
            const topics = JsonBigInt.parse(pushJob.topics as string) as string[];
            const userIds = JsonBigInt.parse(pushJob.userIds as string) as bigint[];
            // for(const topic of topics){
            //     await FirebaseService.sendTopicMessage(topic,{
            //         title: pushJob.title ?? "",
            //         body: pushJob.body ?? "",
            //         data: pushJob.data ?? {},
            //     });
            // }
            if(userIds.length > 0){
                // 查询出所有的tokens
                console.log("userIds",userIds);
                const tokens = await UserFirebaseTokenService.findTokensByUserIds(userIds);
                console.log("tokens",tokens);
                await FirebaseService.sendBatchMessage(tokens,{
                    title: pushJob.title ?? "",
                    body: pushJob.body ?? "",
                    data: JsonBigInt.parse(pushJob.data ?? "{}"),
                })
            }
            done();
        } catch (e: any) {
            console.error(e);
            await PushJobService.failed(pushJob.id, e.message);
            done(new Error(e.message));
            return;
        }
    });
};
start();
console.log("[PushJob] started");