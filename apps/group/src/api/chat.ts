
import { chat } from '@repo/grpc/client'

export const chatClient = new chat.ChatProtoClient(process.env.CHAT_GRPC_ADDR);

