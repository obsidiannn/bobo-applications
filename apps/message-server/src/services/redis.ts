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

  delVal = async (key: string): Promise<void> => {
    this.redisClient.del(key).catch(
      (e) => {

      }
    )
  }

  getVal = async (key: string): Promise<string | null> => {
    return this.redisClient.get(key)
  }

  publish = async (channel: string, message: string): Promise<void> => {
    await this.redisClient.publish(channel, message)
  }

}

let redisClient: RedisWrapper


export const getRedis = () => {
  if(!redisClient){
    redisClient = new RedisWrapper()
  }
  return redisClient
}

export const initRedis = (): void => {
  redisClient = new RedisWrapper()
}
