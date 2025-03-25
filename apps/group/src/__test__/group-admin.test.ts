import { expect, test, describe } from "@jest/globals";
import { buildRequest } from "./test-tool";
import { Wallet } from '@repo/server/wallet';
import { prisma } from "@/lib/database";
describe("Group Test", () => {

    // const oneKey = generatePrivateKey();
    const oneKey = '0x376b376688bfdbd75363ebf3a06c50fe9a88055b856f9e04938855060700f2ea'
    const userWallet = new Wallet(oneKey);
    prisma.$connect()

    test('kick out', async () => {
        const result = await buildRequest("/groups/kick-out", oneKey, {
            id: 2,
            uids: [38]
        });
        
        expect(result.status).toBe(200);
    });

    test('update group name ', async () => {
        const result = await buildRequest("/groups/update-name", oneKey, {
            id: 3,
            name: 'ios group'
        });
        expect(result.status).toBe(200);
    });

    test('update-notice', async () => {
        const response = await buildRequest("/groups/update-notice", oneKey, {
            id: 3,
            name: 'ios group notice'
        });
        expect(response.status).toBe(200);
    });

    test('update-desc', async () => {
        const response = await buildRequest("/groups/update-desc", oneKey, {
            id: 3,
            desc: 'ios group desc',
        });
        expect(response.status).toBe(200);
    });

    test('group dismiss', async () => {
        const response = await buildRequest("/groups/dismiss", oneKey, {
            ids: [3]
        });
        expect(response.status).toBe(200);
    });

    test('group add admin', async () => {
        const response = await buildRequest("/groups/add-admin", oneKey, {
            ids: 3,
            uids: [33]
        });
        expect(response.status).toBe(200);
    });

    test('group remove admin', async () => {
        const response = await buildRequest("/groups/remove-admin", oneKey, {
            ids: 3,
            uids: [33]
        });
        expect(response.status).toBe(200);
    });

    test('group change tag', async () => {
        const response = await buildRequest("/groups/change-tag", oneKey, {
            gid: 3,
            tags: [1,2,3]
        });
        expect(response.status).toBe(200);
    });

    test('group clear message', async () => {
        const response = await buildRequest("/groups/clear-message", oneKey, {
            ids: [3]
        });
        expect(response.status).toBe(200);
    });

    
    
})