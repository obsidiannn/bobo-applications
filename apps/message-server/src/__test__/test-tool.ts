import "dotenv/config";
import JsonBigInt from 'json-bigint';
export const buildRequest = async (host: string, route: string, addr: string, data: any) => {

    return await fetch(host + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Req-Addr': addr,
        },
        body: JsonBigInt.stringify(data),
    });
}