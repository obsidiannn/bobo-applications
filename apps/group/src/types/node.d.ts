declare namespace NodeJS {
    declare interface ProcessEnv {
        S3_ENDPOINT: string;
        S3_AK: string;
        S3_SK: string;
        S3_BUCKET: string;
        S3_REGION: string;
        REDIS_HOST: string;
        REDIS_PORT: number;
        REDIS_PASSWORD: string;
        REDIS_DB: number;
        LOG_FILE: string;
        PORT: number;
        GRPC_ADDRESS: string;
        USER_GRPC_ADDR: string;
        CHAT_GRPC_ADDR: string;
        EVENT_GRPC_ADDR: string
        SEARCH_GRPC_ADDR: string
        GRPC_ADDR: string
    }
}