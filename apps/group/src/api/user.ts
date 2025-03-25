import { user } from '@repo/grpc/client'

export const userClient = new user.UserProtoClient(process.env.USER_GRPC_ADDR);