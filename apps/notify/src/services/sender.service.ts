
import { redisClient } from './redis';
import { Redis } from 'ioredis';
import { UserOnlineService } from './user-online.service';
import JsonBigInt from 'json-bigint'
import { protos } from '@repo/grpc/proto'
export class SenderService {
  private static instantce: SenderService


  static getInstance(): SenderService {
    if (!this.instantce) {
      this.instantce = new SenderService()
    }
    return this.instantce
  }

  getClient(): Redis {
    return redisClient.getClient();
  }

  /**
   * 发布广播
   */
  async publishMessageTopic(message: protos.notify.SocketEventRequest): Promise<void> {
    const client = this.getClient();
    const topic = this.generateTopicKey();
    await client.lpush(topic, JsonBigInt.stringify(message));
  }

  /**
   * 传入的 user sequence 数组，正向排序
   *  然后根据
   * @param userIdxs
   * @returns
   */
  async onlineCheck(userIds: number[]): Promise<number[]> {
    const mapState = await UserOnlineService.checkOnline(userIds.map(BigInt));
    const offlineUserIds: number[] = []
    for (const userId of userIds) {
      const state = mapState.get(BigInt(userId));
      if (!state) {
        offlineUserIds.push(userId)
      }
    }
    return offlineUserIds
  }

  generateChunkKey(min: number, max: number): string {
    return 'USER_SEQUENCE_CHUNK_' + min.toString() + '_' + max.toString();
  }

  /**
   * redis publish topic key
   * @param chatId
   */
  generateTopicKey(): string {
    return 'SOCKET_MESSAGE_QUEUE_TOPIC'
  }
}
