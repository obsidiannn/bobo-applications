import { getInstance } from "@/lib/cache";
import { user as userGrpc } from "@repo/grpc/client"
import { CachePlus } from "@repo/server/cache";
import { protos } from "@repo/grpc/proto";
import { log as logger } from "@/lib/system";
import JsonBigInt from "json-bigint";
export class UserService {
    static modelName: string = "notify:users";
    private cache: CachePlus;
    private static instance: UserService;
    private protoClient: userGrpc.UserProtoClient;
    constructor(cache: CachePlus, protoClient: userGrpc.UserProtoClient) {
        this.protoClient = protoClient;
        this.cache = cache;
    }
    private static async make() {
        if (!UserService.instance) {
            const cacheClient = await getInstance();
            const cache = new CachePlus(UserService.modelName, cacheClient);
            UserService.instance = new UserService(cache, new userGrpc.UserProtoClient(process.env.USER_GRPC_ADDR));
        }
        return UserService.instance;
    }
    static async findById(userId: bigint) {
        const items = await UserService.findByIds([userId]);
        return items.length === 0 ? undefined : items[0];
    }
    static async findByAddr(addr: string) {
        const items = await UserService.findByAddrs([addr]);
        return items.length === 0 ? undefined : items[0];
    }
    static async findByAddrs(addrs: string[]) {
        const instance = await UserService.make();
        const ids: bigint[] = [];
        const items: protos.user.User[] = [];
        const unCachedAddrs: string[] =[];
        for (const addr of addrs) {
            const cacheKey = `addr:${addr}`;
            const cacheVal = await instance.cache.get(cacheKey);
            if (cacheVal) {
                try {
                    ids.push(BigInt(cacheVal as number));
                } catch (error) {
                    logger.error("Error fetching data:" + JsonBigInt.stringify(error));
                    continue;
                }
            }else{
                unCachedAddrs.push(addr);
            }
        }
        if(unCachedAddrs.length > 0){
            const users = await instance.protoClient.findUsersByAddrs(unCachedAddrs);
            for(const user of users){
                const cacheKey = `addr:${user.addr}`;
                await instance.cache.set(cacheKey, user.id, 3000);
                items.push(user);
            }
        }
        if(ids.length>0){
            const users = await UserService.findByIds(ids);
            for(const user of users){
                items.push(user);
            }
        }
        return items;
    }
    static async findByIds(ids: bigint[]) {
        const instance = await UserService.make();
        const users: protos.user.User[] = [];
        const cacheKeys = ids.map((id) => `id:${id}`);
        const cachedUsers = await instance.cache.mget(...cacheKeys);
        for (const cachedUser of cachedUsers) {
            if (cachedUser) {
                try {
                    users.push(JsonBigInt.parse(cachedUser as string) as protos.user.User);
                } catch (error) {
                    logger.error("Error fetching data:" + JsonBigInt.stringify(error));
                    continue;
                }
            }
        }
        const cachedIds = users.map((u) => u.id);
        const unCachedIds = ids.filter((id) => !cachedIds.includes(id));
        if (unCachedIds.length > 0) {
            const fetchedUsers = await await instance.protoClient.findUsersByIds(unCachedIds.map(BigInt));
            for (const user of fetchedUsers) {
                users.push(user);
                await instance.cache.set(`id:${user.id}`, JsonBigInt.stringify(user));
            }
        }
        return users;
    }
}