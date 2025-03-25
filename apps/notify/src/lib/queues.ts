import Queue from "bull";

export const pushQueue = new Queue('push message', { redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD,
} });