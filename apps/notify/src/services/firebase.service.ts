import { cert, App, Credential } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { MulticastMessage, getMessaging, TopicMessage } from 'firebase-admin/messaging';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { IModel } from '@repo/enums';
import { protos } from '@repo/grpc/proto'
import { PushJobService } from './push-job.service';
import JsonBigInt from 'json-bigint'
import { pushQueue } from '@/lib/queues';
export interface IFirebaseMessage {
  title: string;
  body: string;
  data: any;
}
export class FirebaseService {
  private static instance: FirebaseService;
  private firebaseAdmin: App;
  private constructor(config: Credential, agent?: HttpsProxyAgent<string>) {
    this.firebaseAdmin = admin.initializeApp({
      credential: config,
      httpAgent: agent
    }, crypto.randomUUID())
  }
  static async make() {
    if (!FirebaseService.instance) {
      const path = process.env.FIREBASE_CONFIG_PATH;
      const agent = process.env.HTTP_PROXY ? new HttpsProxyAgent(process.env.HTTP_PROXY) : undefined
      const config: Credential = cert(path, agent)
      FirebaseService.instance = new FirebaseService(config, agent);
    }
    return FirebaseService.instance;
  }
  static async sendTopicMessage(topic: string, message: IFirebaseMessage) {
    const instance = await FirebaseService.make();
    const topicMessage: TopicMessage = {
      notification: {
        title: message.title,
        body: message.body,
      },
      android: {
        priority: 'high',
        notification: {
          priority: 'high',
          imageUrl: 'https://foo.bar.pizza-monster.png',
        }
      },
      webpush: {
        headers: {
          image: 'https://foo.bar.pizza-monster.png',
        }
      },
      data: message.data ?? {
        type: 1
      },
      topic,
    }
    return await getMessaging(instance.firebaseAdmin).send(topicMessage);
  }
  static async sendBatchMessage(tokens: string[], message: IFirebaseMessage) {
    const instance = await FirebaseService.make();
    const batchMessage: MulticastMessage = {
      notification: {
        title: message.title,
        body: message.body,
      },

      android: {
        priority: 'high',
        notification: {
          priority: 'high',
          imageUrl: 'https://foo.bar.pizza-monster.png',
        }
      },
      webpush: {
        headers: {
          image: 'https://foo.bar.pizza-monster.png',
        }
      },
      data: message.data ?? {
        type: 1
      },
      tokens
    }
    const result = await getMessaging(instance.firebaseAdmin).sendEachForMulticast(batchMessage)
    console.log("firebase 发送结果", result.responses[0].error);
    return result;
  }



  static initMessage(
    message: protos.notify.SocketEventRequest,
    chatType: IModel.IChat.IChatTypeEnum
  ): MulticastMessage {
    let title = '单聊'
    let screen = 'UserChatUI'
    if (chatType === IModel.IChat.IChatTypeEnum.GROUP) {
      title = '群聊'
      screen = 'GroupChatUI'
    } else if (chatType === IModel.IChat.IChatTypeEnum.OFFICIAL) {
      title = '系统通知'
      screen = 'OfficialChat'
    }


    const firebaseMessage: MulticastMessage = {
      notification: {
        title,
        body: '您收到了一条' + title + '消息'
      },
      android: {
        priority: 'high',
        notification: {
          priority: 'high',
          imageUrl: 'https://foo.bar.pizza-monster.png',
        }
      },
      webpush: {
        headers: {
          image: 'https://foo.bar.pizza-monster.png',
        }
      },
      // data: {
      //   sourceType: 'chat',
      //   subType: chatType.toString(),
      //   sourceId: message.chatId.toString(),
      //   sequence: message.sequence.toString()
      // },
      data: {
        sourceType: 'link',
        sourceUrl: "bobo-chat://LinkScreen/" + screen + "?id=" + message.channel + "&sequence=" + message.sequence.toString(),
      },
      tokens: []
    }
    return firebaseMessage
  }

  static async push(request: protos.notify.PushRequest) {
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
  }
}
