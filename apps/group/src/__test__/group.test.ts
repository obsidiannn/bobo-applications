import { expect, test, describe } from "@jest/globals";
import { randomInt } from "crypto";
import { buildRequest } from "./test-tool";
import { Wallet } from '@repo/server/wallet';
import { generateId } from "@repo/server/utils";
import { encrypted } from '@repo/server/crypto'
describe("Group Test", () => {

    // const oneKey = generatePrivateKey();
    const oneKey = '0x376b376688bfdbd75363ebf3a06c50fe9a88055b856f9e04938855060700f2ea'
    const userWallet = new Wallet(oneKey);

    test('createGroup', async () => {
        const groupPassword = generateId();
        const sharedSecret = userWallet?.computeSharedSecret(userWallet.getPublicKey())
        const enc_key = encrypted(groupPassword, sharedSecret ?? '');
        const result = await buildRequest("/groups/create", oneKey, {
            name: 'ios_group' + randomInt(100),
            isEnc: 1,
            type: 1,
            banType: 1,
            searchType: 1,
            // uids: z.array(z.number()).min(1),
            encKey: enc_key,
        });
        expect(result.status).toBe(200);
    });

    test('mine group list ', async () => {
        const result = await buildRequest("/groups/list", oneKey, {});
        expect(result.status).toBe(200);
        
        // const response = await buildRequest("/groups/list-by-ids", oneKey, {
        //     gids: JSON.parse(result.body ?? '').items
        // });
        // expect(response.status).toBe(200);
    });

    test('get info by id', async () => {
        const response = await buildRequest("/groups/get-info", oneKey, {
            id: 2
        });
        expect(response.status).toBe(200);
    });

    test('get-single-info', async () => {
        const response = await buildRequest("/groups/get-single-info", oneKey, {
            ids: [2]
        });
        expect(response.status).toBe(200);
    });

})