import { expect, test, describe } from "@jest/globals";
import { buildRequest } from "./test-tool";
import { Wallet } from '@repo/server/wallet';
import { encrypted, decrypted } from '@repo/server/crypto'
import { prisma } from "@/lib/database";
describe("Group Test", () => {

    // const oneKey = generatePrivateKey();
    const oneKey = '0x376b376688bfdbd75363ebf3a06c50fe9a88055b856f9e04938855060700f2ea'
    const userWallet = new Wallet(oneKey);
    prisma.$connect()

    test('invite-join', async () => {
        const ownerMembers = await prisma.groupMembers.findMany({
            where: {
                uid: 37,
                role: 1
            }
        })
        if (ownerMembers === null || ownerMembers.length <= 0) {
            throw new Error()
        }
        const ownerMember = ownerMembers[0]

        let sharedSecret: string
        if (ownerMember.encPri !== '' && ownerMember.encPri !== null && ownerMember.encPri !== undefined) {
            const key = userWallet.computeSharedSecret(ownerMember.encPri)
            sharedSecret = decrypted(ownerMember.encKey, key ?? '')
        } else {
            const key = userWallet.computeSharedSecret(userWallet.getPublicKey())
            sharedSecret = decrypted(ownerMember.encKey ?? '', key ?? '')
        }
        const groupPassword = decrypted(ownerMember.encKey ?? '', sharedSecret)

        const itemSecretKey = userWallet.computeSharedSecret('0x02ed5f96f45924c9fcd53b8c2462bddd67d97defcdb94f8f2e3dab34c8c2a84887')
        const enkey = encrypted(groupPassword, itemSecretKey ?? '');

        const result = await buildRequest("/groups/invite-join", oneKey, {
            id: 3,
            items: [
                {
                    uid: Number(33),
                    encPri: userWallet.getPublicKey(),
                    encKey: enkey,
                }
            ]
        });

        expect(result.status).toBe(200);
    });

    test('require - join', async () => {
        const result = await buildRequest("/groups/require-join", oneKey, {
            id: 3,
            remark: 'ios group remark'
        });
        expect(result.status).toBe(200);
    });

    test('reject-join', async () => {
        const response = await buildRequest("/groups/reject-join", oneKey, {
            id: 3,
            uids: [33]
        });
        expect(response.status).toBe(200);
    });

    test('apply-list', async () => {
        const response = await buildRequest("/groups/apply-list", oneKey, {
            ids: [3],
        });
        expect(response.status).toBe(200);
    });

    test('my-apply-list', async () => {
        const response = await buildRequest("/groups/my-apply-list", oneKey, {
            
        });
        expect(response.status).toBe(200);
    });



})