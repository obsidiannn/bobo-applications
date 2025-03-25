import middleware from "@repo/server/middleware";
import { UserService } from "@/services/user.service";
export const authMiddleware = middleware.authMiddleware(async (addr: string) => await UserService.findByAddr(addr));
