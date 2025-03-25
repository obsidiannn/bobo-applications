import { generateChunkKey, sliceIntoChunks } from '@/lib/util'
import Redis from 'ioredis'
export const initClient = (): Redis => {
  return new Redis(
    {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
      password: process.env.REDIS_PASSWORD
    }
  )
}

export class RedisWrapper {
  private redisClient: Redis

  constructor() {
    this.redisClient = initClient()
  }
  init(): void {
    try {
      if (this.redisClient.status === 'close') {
        this.redisClient.connect()
      }
    } catch { }
  }

  getClient(): Redis {
    return this.redisClient
  }

  setex = async (key: string, val: string, tls: number): Promise<void> => {
    this.redisClient.setex(key, tls, val).catch(
      (e) => {

      }
    )
  }

  del = async (key: string): Promise<void> => {
    this.redisClient.del(key).catch(
      (e) => {

      }
    )
  }

  get = async (key: string): Promise<string | null> => {
    return await this.redisClient.get(key)
  }

  publish = async (channel: string, message: string): Promise<void> => {
    await this.redisClient.publish(channel, message)
  }

  setBit = async (seq: string, val: 0 | 1): Promise<void> => {
    if (seq === undefined || seq === null) return
    const seqNum = parseInt(seq)
    if (
      seqNum !== undefined &&
      seqNum !== null &&
      typeof seqNum === 'number' &&
      seqNum > 0
    ) {
      const result = sliceIntoChunks([seqNum], 1024)
      if (result.length > 0) {
        const item = result[0]
        if (item) {
          const key = generateChunkKey(item.min, item.max)
          console.log('在线状态：', seqNum, val === 0 ? '离线' : '在线')
          await this.redisClient.setbit(key, seqNum, val)
        }
      }
    }
  }

}

export let redisClient: RedisWrapper
export let subscribeClient: RedisWrapper

export const initRedis = (): void => {
  redisClient = new RedisWrapper()
  subscribeClient = new RedisWrapper()
}
