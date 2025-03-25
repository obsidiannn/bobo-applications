import { expect, test, describe } from '@jest/globals';
import * as dotenv from 'dotenv'
import { buildRequest } from '../helpers/test-tool';
dotenv.config()
const userPrivateKey = process.env.TEST_USER_PRIVATE_KEY ?? '';
describe('Friend User Extend Info Test', () => {
    test("get info", async () => {
        const result = await buildRequest('/friendUserExtendInfo/getInfo', userPrivateKey, {})
        expect(result.rep.status).toBe(200);
    })
})