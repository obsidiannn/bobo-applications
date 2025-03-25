// import { describe, test, expect } from '@jest/globals';
// import { Friend } from '@prisma/client';
// describe('Friend Test', () => {
//     const oneKey = '0xa98f352b714890a8c916521fdb0c9dbe8c1d52195d516304cef5de22c4d16c70'
//     const twoKey = generateke();

//     test('添加好友', async () => {
//         console.log('key=', oneKey);
//         const result = await buildRequest('/friendApplys/create', oneKey, {
//             userId: 25
//         });
//         console.log(result);

//     })
//     test("start friend test", async () => {
//         await buildRequest('/auth/register', oneKey, {})
//         await buildRequest('/auth/register', twoKey, {})
//         const twoResult = await buildRequest('/auth/info', twoKey, {});
//         const twoUser = twoResult.data.data.user;
//         const result = await buildRequest('/friendApplys/create', oneKey, {
//             userId: twoUser.id,
//         });
//         expect(result.rep.status).toBe(200);
//         const resultList = await buildRequest('/friendApplys/getList', twoKey, {});
//         const agreeResult = await buildRequest('/friendApplys/agree', twoKey, {
//             id: resultList.data.data.friendApplys[0].id,
//         });
//         expect(agreeResult.rep.status).toBe(200);
//         // 好友列表ids
//         const friendIdListResult = await buildRequest('/friends/getList', twoKey, {});
//         expect(friendIdListResult.rep.status).toBe(200);
//         const friendIds = friendIdListResult.data.data.friendIds as number[];
//         // 批量获取
//         const getBatchInfoResult = await buildRequest('/friends/getBatchInfo', twoKey, {
//             ids: friendIds
//         });
//         expect(getBatchInfoResult.rep.status).toBe(200);
//         const friends = getBatchInfoResult.data.data.friends as Friend[]
//         const updateRemarkResult = await buildRequest('/friends/updateRemark', twoKey, {
//             id: friends[0].id,
//             remark: "太古"
//         });
//         expect(updateRemarkResult.rep.status).toBe(200);
//         // 判断是否为好友
//         const relationListResult = await buildRequest('/friends/getRelationList', twoKey, {
//             userIds: [friends[0].objUserId],
//         });

//         expect(relationListResult.rep.status).toBe(200);

//         // 单向删除好友
//         const delResult = await buildRequest('/friends/del', twoKey, {
//             id: friends[0].id,
//         });
//         expect(delResult.rep.status).toBe(200);

//     })
// })