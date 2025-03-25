import "dotenv/config";
import app from '@/app';
import JsonBigInt from 'json-bigint';

export const buildRequest = async (route: string, addr: string, data: any) => {
    return await app.request(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Req-Addr': addr,
        },
        body: JsonBigInt.stringify(data),
    });
}