import { userClient } from "@/api/user";
import middleware from "@repo/server/middleware";
export const authMiddleware = middleware.authMiddleware(async (addr: string) => {
    const response = await userClient.findUsersByAddrs([addr])
    if (response && response.length > 0) {
        return response[0]
    }
    return null
});
