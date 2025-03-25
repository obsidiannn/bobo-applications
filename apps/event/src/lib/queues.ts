import Queue from "bull";

export const eventQueue = new Queue('event job', { redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD,
} });