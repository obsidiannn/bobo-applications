declare namespace NodeJS {
    declare interface ProcessEnv {
        REDIS_HOST: string;
        REDIS_PORT: number;
        REDIS_PASSWORD: string;
        REDIS_DB: number;
        LOG_FILE: string;
        PORT: number;
        GRPC_ADDR: string;
        USER_GRPC_ADDR: string;
        CHAT_GRPC_ADDR: string;
        FIREBASE_CONFIG_PATH: string;
        NOTIFY_BOT_ID: number;
    }
}