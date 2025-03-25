import { SystemService } from 'app/services/system.service';
import { computeDataHash, Wallet } from 'app/utils/wallet';
import { SYSTEM_PUBLIC_KEY } from "@env"
import ky, { KyRequest } from 'ky';
import { Platform } from 'react-native';
import quickCrypto from "app/utils/quick-crypto";
import { AuthService } from 'app/services/auth.service';
const encodeInterceptor = async (wallet: Wallet, req: KyRequest): Promise<InternalAxiosRequestConfig<any>> => {
    const content = typeof config.data === 'string' ? config.data : JSON.stringify(config.data ?? {})
    const time = Date.now();
    const sharedSecret = wallet.computeSharedSecret(SYSTEM_PUBLIC_KEY)

    const dataHash = computeDataHash(content + ':' + time);
    const sign = wallet.signMessage(dataHash)
    req.headers.set('X-Req-Sign', sign);
    req.headers.set('X-Req-Data-Hash', dataHash);
    req.headers.set('X-Req-Time', time.toString());
    req.headers.set('X-Req-OS', Platform.OS);
    req.headers.set('X-Req-Pub-Key', wallet.getPublicKey());
    const data = quickCrypto.En(sharedSecret, Buffer.from(content, "utf8"))
    //
}
export const createInstance = () => {
    const wallet = AuthService.GetWallet();
    if (!wallet) {
        throw new Error('請先登錄');
    }
    return ky.extend({
        prefixUrl: SystemService.GetApiUrlByCache(),
        hooks: {
            beforeRequest: [
                async (request) => {
                    // 测试
                    const time = Date.now();
                },
            ],
            afterResponse: [],
            beforeError: [
                async (error) => {
                    // 测试
                    const { response } = error;
                    if (response && response.body) {
                        error.name = 'GitHubError';
                        error.message = `${response.body.message} (${response.status})`;
                    }
                    return error;
                }
            ]
        }
    })
}