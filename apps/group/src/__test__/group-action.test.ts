import { expect, test, describe } from "@jest/globals";
import { buildRequest } from "./test-tool";
import { Wallet} from '@repo/server/wallet';
describe("Group Test", () => {

    // const oneKey = generatePrivateKey();
    const oneKey = '0x376b376688bfdbd75363ebf3a06c50fe9a88055b856f9e04938855060700f2ea'
    const userWallet = new Wallet(oneKey);


    test('quit batch', async () => {
        const response = await buildRequest("/groups/quit-batch", oneKey, {
            ids: [2]
        });
        expect(response.status).toBe(200);
    });

    test('quit all ', async () => {
        const result = await buildRequest("/groups/quit-all", oneKey, {});
        expect(result.status).toBe(200);
    });

    test('update alias', async () => {
        const response = await buildRequest("/groups/update-alias", oneKey, {
            id: 2,
            alias: '我是ios备注'
        });
        expect(response.status).toBe(200);
    });

})