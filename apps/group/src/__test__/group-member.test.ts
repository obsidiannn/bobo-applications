import { expect, test, describe } from "@jest/globals";
import { buildRequest } from "./test-tool";
import { Wallet } from '@repo/server/wallet';
import { prisma } from "@/lib/database";
describe("Group Test", () => {

    // const oneKey = generatePrivateKey();
    const oneKey = '0x376b376688bfdbd75363ebf3a06c50fe9a88055b856f9e04938855060700f2ea'
    const userWallet = new Wallet(oneKey);
    prisma.$connect()

    test('member list', async () => {
        const result = await buildRequest("/groups/members-list", oneKey, {
            id: 3
        });

        expect(result.status).toBe(200);
    });

    test('members ', async () => {
        const result = await buildRequest("/groups/members", oneKey, {
            id: 3,
            limit: 10,
            page: 2
        });
        expect(result.status).toBe(200);
    });


})