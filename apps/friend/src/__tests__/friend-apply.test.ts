import { expect, test, describe } from '@jest/globals';
import * as dotenv from 'dotenv'
import { buildRequest } from '../helpers/test-tool';
import { XWallet } from '../helpers/web3';

dotenv.config()
describe('Friend Apply Test', () => {
    const oneKey = XWallet.generatePrivateKey();
    const twoKey = XWallet.generatePrivateKey();
    test("apply", async () => {
        await buildRequest('/auth/register', oneKey, {})
        await buildRequest('/auth/register', twoKey, {})
        const twoResult = await buildRequest('/auth/info', twoKey, {});
        const twoUser = twoResult.data.data.user;
        const result = await buildRequest('/friendApplys/create', oneKey, {
            userId: twoUser.id,
        });
        expect(result.rep.status).toBe(200);

        const resultList = await buildRequest('/friendApplys/getList', twoKey, {});
        expect(result.rep.status).toBe(200);
        const redResult = await buildRequest('/friendUserExtendInfo/read', twoKey, {
            friendApplyId: resultList.data.data.friendApplys[0].id,
        });
        expect(redResult.rep.status).toBe(200);
        const rejectResult = await buildRequest('/friendApplys/reject', twoKey, {
            id: resultList.data.data.friendApplys[0].id,
            reson: "xx",
        });
        expect(rejectResult.rep.status).toBe(200);
        const delResult = await buildRequest('/friendApplys/del', twoKey, {
            id: resultList.data.data.friendApplys[0].id,
        });
        expect(delResult.rep.status).toBe(200);
        const createResult = await buildRequest('/friendApplys/create', oneKey, {
            userId: twoUser.id
        });
        expect(createResult.rep.status).toBe(200);
        const twoResultList = await buildRequest('/friendApplys/getList', twoKey, {});
        const agreeResult = await buildRequest('/friendApplys/agree', twoKey, {
            id: twoResultList.data.data.friendApplys[0].id,
            reson: "xx",
        });
        expect(agreeResult.rep.status).toBe(200);
    })
})