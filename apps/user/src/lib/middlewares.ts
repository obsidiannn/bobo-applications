import middleware from "@repo/server/middleware";
import { UserService } from "@/services/user.service";
export const authMiddleware = middleware.authMiddleware(async (addr: string) => {
    const user = await UserService.findByAddr(addr)
    return user;
});
