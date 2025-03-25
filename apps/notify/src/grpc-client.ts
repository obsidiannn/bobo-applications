import "dotenv/config"
import { notify as notifyGrpc } from "@repo/grpc/client"
class NotifyService {
    private static instance: NotifyService;
    private protoClient: notifyGrpc.NotifyProtoClient;
    constructor(protoClient: notifyGrpc.NotifyProtoClient) {
        this.protoClient = protoClient;
    }
    private static async make() {
        if (!NotifyService.instance) {
            NotifyService.instance = new NotifyService(new notifyGrpc.NotifyProtoClient(process.env.GRPC_ADDR));
        }

        return NotifyService.instance;
    }
    static async pushMessage() {
        const instance = await NotifyService.make();
        const res = await instance.protoClient.pushMessage(
            ["bobo_news"],
            [116n],
            "您好！",
            "欢迎注册",
            {}
        );
        return res;
    }
}
(async () => {
    try {
        await NotifyService.pushMessage()
    } catch (e) {
        console.log(e);
    } finally {
        process.exit(0);
    }
})();