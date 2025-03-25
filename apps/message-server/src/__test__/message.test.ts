
import { expect, test, describe } from "@jest/globals";
import { buildRequest } from "./test-tool";
import "dotenv/config"
import { generateId } from "@repo/server/utils";

describe('chat test ', () => {
    const host = 'http://localhost:3009'
    const addr = '0xdfb2d2b8dc512733cefc8cc851c2dbc43692eba2'

    test("send message", async () => {
        const rep = await buildRequest(host, "/messages/send", addr, {
            id: generateId(),
            chatId: '6672be6ed996912dbadaea2b',
            content: '',
            type: 1,
            isEnc: 1,
        });
        expect(rep.status).toBe(200);
    });

    test('message list ', async () => {
        const rep = await buildRequest(host, "/messages/list", addr, {
            chatId: '6672be6ed996912dbadaea2b',
            sequence: 1,
            direction: 'down',
            limit: 20
        });
        expect(rep.status).toBe(200);
    })

    test('messages detail', async () => {
        const rep = await buildRequest(host, "/messages/detail", addr, {
            chatId: '6672be6ed996912dbadaea2b',
            ids: ['a4e72387362b0cadb45f56ba','d2f48db9953fda6ecef43adc']
        });
        expect(rep.status).toBe(200);
    })

})