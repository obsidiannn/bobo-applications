import { globalKV, globalStorage } from "app/utils/kv-tool"
import { getLists } from "app/api/sys/node"
import { SYSTEM_API_URL} from "@env";

export class SystemService {
    static GetApiUrlByCache = () => {
        // const apiUrl = globalStorage.get('string', 'NOW_API_URL')
        // if (apiUrl) {
        //     return apiUrl as string;
        // }
        return SYSTEM_API_URL;
    }
    static GetApiUrl = () => {

    }
    static GetSocketUrl = (): string => {
        const url = globalKV.get('string', 'NOW_SOCKET_URL') ?? ''
        return String(url)
    }
    static GetStaticUrl = (): string => {
        const url = globalKV.get('string', 'NOW_STATIC_URL') ?? ''
        return String(url)
    }


    static refreshNodes = () => {
        return new Promise((resolve, reject) => {
            getLists().then(rep => {
                const groupByType = rep.nodes.reduce((result, node) => {
                    const { type } = node;
                    if (!result[type]) {
                        result[type] = [];
                    }
                    result[type].push(node.addr);
                    return result;
                }, {} as Record<string, Array<string>>);
                if (Object.prototype.hasOwnProperty.call(groupByType, 'STATIC_URL')) {
                    globalKV.set("NOW_STATIC_URL", groupByType['STATIC_URL'][0]);
                    globalKV.set("STATIC_URL_LIST", JSON.stringify(groupByType['STATIC_URL']))
                }
                if (Object.prototype.hasOwnProperty.call(groupByType, 'API_GATEWAY')) {
                    globalKV.set("NOW_API_URL", groupByType['API_GATEWAY'][0]);
                    globalKV.set("API_GATEWAY", JSON.stringify(groupByType['API_GATEWAY']))
                }
                if (Object.prototype.hasOwnProperty.call(groupByType, 'SOCKET_API')) {
                    globalKV.set("NOW_SOCKET_URL", groupByType['SOCKET_API'][0]);
                    globalKV.set("SOCKET_API", JSON.stringify(groupByType['SOCKET_API']))
                }
                resolve(true);
            }).catch((err) => {
                reject(err);
            });
        })
    }
}