import "dotenv/config";
import app from '@/app';
import JsonBigInt from 'json-bigint';
import { Wallet } from "@repo/server/wallet";

export const buildRequest = async (route: string, priKey: string, data: any) => {
    const wallet = new Wallet(priKey);
    const oneAddr = wallet.getAddress();
    return await app.request(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Req-Pub-Key': wallet.getPublicKey(),
            'X-Req-Addr': wallet.getAddress(),
        },
        body: JsonBigInt.stringify(data),
    });
}