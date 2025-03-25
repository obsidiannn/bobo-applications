import userApi from "@/api/user";
import middleware from "@repo/server/middleware";
export const authMiddleware = middleware.authMiddleware(async (addr: string) => {
    const response = await userApi.queryUserIdFromAddress(addr)
    console.log('middle user=',response);
    
    if (response) {
        return response
    }
    return null
});
