import { user as userGrpc } from "@repo/grpc/client"
export class UserService {
    private static instance: UserService;
    private protoClient: userGrpc.UserProtoClient;
    constructor(protoClient: userGrpc.UserProtoClient) {
        this.protoClient = protoClient;
    }
    private static async make() {
        if (!UserService.instance) {
            UserService.instance = new UserService(new userGrpc.UserProtoClient(process.env.USER_GRPC_ADDR));
        }
        return UserService.instance;
    }
    static async findById(userId: bigint) {
        const items = await UserService.findByIds([userId]);
        if (items.length === 0) {
            return undefined;
        }
        return items[0];
    }
    static async findByAddr(addr: string) {
        const items = await UserService.findByAddrs([addr]);
        if (items.length === 0) {
            return undefined;
        }
        return items[0];
    }
    static async findByAddrs(addrs: string[]) {
        const instance = await UserService.make();
        const items = await instance.protoClient.findUsersByAddrs(addrs);
        return items.map(item => {
            return {
                ...item,
                id: BigInt(item.id)
            };
        });
    }
    static async findByIds(userIds: bigint[]) {
        const instance = await UserService.make();
        const items = await instance.protoClient.findUsersByIds(userIds);
        return items.map(item => {
            return {
                ...item,
                id: BigInt(item.id)
            };
        });
    }
}