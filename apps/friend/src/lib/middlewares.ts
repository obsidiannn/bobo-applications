import middleware from "@repo/server/middleware";
import { userClient } from "@/grpc/user";

export const authMiddleware = middleware.authMiddleware(async (addr: string) => {
    
    const response = await userClient.findUsersByAddrs([addr])
    if (response && response.length > 0) {
        return response[0]
    }
    return null
});
