declare namespace NodeJS {
    declare interface ProcessEnv {
        LOG_FILE: string;
        PORT: number;
        CHAT_GRPC_ADDR: string;
        USER_GRPC_ADDR: string;
        EVENT_GRPC_ADDR: string;
        GRPC_ADDR: string
        MEILISEARCH_ADDR: string
        MEILISEARCH_API_KEY: string
    }

}