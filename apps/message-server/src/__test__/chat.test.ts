
import { expect, test, describe } from "@jest/globals";
import Crypto from "crypto";
import { faker } from "@faker-js/faker";
import { buildRequest } from "./test-tool";
import "dotenv/config"
import { prisma } from '@/lib/database'

describe('chat test ', () => {
    const host = 'http://localhost:3009'
    const addr = '0xdfb2d2b8dc512733cefc8cc851c2dbc43692eba2'

    test("mine chat", async () => {
        const rep = await buildRequest(host, "/chat/mine-chat", addr, {});
        expect(rep.status).toBe(200);
    });

    test('hide chat', async () => {
        const rep = await buildRequest(host, "/chat/delete", addr, {
            ids: '666ac08da02f93ee2a03a8f2'
        });
        expect(rep.status).toBe(200);
    })

    test('raise top', async () => {
        const rep = await buildRequest(host, "/chat/raise-top", addr, {
            chatUserId: '666ac08da02f93ee2a03a8f2',
            top: true
        });
        expect(rep.status).toBe(200);
    })
    test('find chatid by userId', async () => {
        const rep = await buildRequest(host, "/chat/id-by-user", addr, {
            userId: 37
        });
        expect(rep.status).toBe(200);
    })


})