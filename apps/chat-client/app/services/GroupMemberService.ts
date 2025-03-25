import generateUtil from "app/utils/generateUtil";
import groupApi from "../api/group/group";

import userService from "./user.service";
import {
    GroupApplyItem, GroupCreateReq, GroupDetailItem, GroupManagerChangeReq,
    GroupMemberItemVO, GroupMemberResp, GroupMembersReq, GroupRequireJoinResp,
    GroupSingleItem, GroupTagReq
} from "@repo/types";
import quickCrypto from "app/utils/quick-crypto";
import { IModel } from "@repo/enums";
import { LocalMessageService } from "./LocalMessageService";
import search from "app/api/discovery/search";
import { LocalGroupService } from "./LocalGroupService";
import groupMapper from "app/utils/group.mapper";
import { LocalGroupMemberService } from "./LocalGroupMemberService";
import groupMemberMapper from "app/utils/groupMember.mapper";

const quit = async (gid: number) => {
    return true;
}
const quitAll = async () => {
    return groupApi.quitAll()
}

const searchGroup = async (keyword: string, page: number, limit: number = 10): Promise<{
    items: GroupDetailItem[],
    total: number
}> => {
    page = page <= 0 ? 1 : page
    const groupIdsResp = await search.query({
        keyword,
        page,
        limit,
        type: 0
    })
    const groupIds = groupIdsResp.items ?? []
    if (groupIds.length > 0) {
        const result = await groupApi.groupDetail({ ids: groupIds })
        return { items: result.items, total: groupIdsResp.total }
    }
    return { items: [], total: 0 }
}

const queryByIdIn = async (groupIds: number[]): Promise<Map<number, GroupDetailItem>> => {
    const entities = await LocalGroupService.findByIdInWithTimeout(groupIds)
    const entityMap = new Map<number, GroupDetailItem>()
    if (entities && entities.length > 0) {
        for (let i = 0; i < entities.length; i++) {
            const e = entities[i];
            entityMap.set(e.id, groupMapper.entity2Dto(e))
        }
    }
    const missedId = groupIds.filter(id => !entityMap.has(id))
    if (missedId.length > 0) {
        const groupResp = await groupApi.groupDetail({ ids: missedId })
        if (groupResp.items && groupResp.items.length > 0) {
            groupResp.items.forEach(e => {
                entityMap.set(e.id, e)
            })
            await batchSaveLocal(groupResp.items)
        }
    }
    return entityMap
}

const queryLocalByIdIn = async (groupIds: number[]): Promise<Map<number, GroupDetailItem>> => {
    const entities = await LocalGroupService.findByIdInWithoutTimeout(groupIds)
    const entityMap = new Map<number, GroupDetailItem>()
    if (entities && entities.length > 0) {
        for (let i = 0; i < entities.length; i++) {
            const e = entities[i];
            entityMap.set(e.id, groupMapper.entity2Dto(e))
        }
    }
    return entityMap
}
// 獲取羣組列表
const getMineList = async (_groupIds?: number[]): Promise<GroupDetailItem[]> => {
    try {
        const groupIds: number[] = []
        if (!_groupIds) {
            const idResp = await groupApi.mineGroupList({})
            if (!idResp.items || idResp.items.length <= 0) {
                return []
            }
            groupIds.push(...idResp.items)
        } else {
            groupIds.push(..._groupIds)
        }
        const entityMap = await queryByIdIn(groupIds)
        const result: GroupDetailItem[] = []
        groupIds.forEach(id => {
            const group = entityMap.get(id)
            if (group) {
                result.push(group)
            }
        })
    } catch (error) {

    }

    return []
}


/**
 * 刷新或者加载那些可能存在的新的chats
 * @param chats 这里会存在
 * @returns 
 */
const checkAndRefresh = async (): Promise<GroupDetailItem[]> => {
    const news: GroupDetailItem[] = []
    try {
        const lastest = await LocalGroupService.findLatestId()


        if (lastest) {
            const idResp = await groupApi.groupIdAfter(lastest)
            if (idResp && idResp.items.length > 0) {
                const missedIds = await LocalGroupService.findIdNotIn(idResp.items)
                if (missedIds && missedIds.length > 0) {
                    const newsData = await getMineList(missedIds)
                    news.push(...newsData)
                }
            }
        } else {
            // const newsData = await mineChatList()
            // news.push(...newsData)
            // return { olds, news }
        }
    } catch (e) {
        console.log('[group]检查group异常', e);
    }
    return news
}


// 用於羣組成員索引表的數據接口
const getMemberList = async (gid: number, requireUids?: number[]): Promise<GroupMemberItemVO[]> => {
    const data = await groupApi.getGroupMembersById({ id: gid, uids: requireUids });
    const { items } = data;
    const uids = items.map(i => i.uid)
    const userHash = await userService.getUserHash(uids)
    const result = items.map(i => {
        const user = userHash.get(i.uid)
        const vo: GroupMemberItemVO = {
            id: i.uid,
            groupId: i.groupId,
            uid: i.uid,
            role: i.role,
            groupAlias: i.myAlias ?? '',
            groupAliasIdx: i.aliasIdx ?? '',
            name: user?.nickName ?? '',
            nameIndex: user?.nickNameIdx ?? '',
            pubKey: user?.pubKey ?? '',
            sign: user?.sign ?? '',
            gender: user?.gender ?? 0,
            avatar: user?.avatar ?? '',
            status: i.status,
            createdAt: i.createdAt
        }
        return vo
    })
    void LocalGroupMemberService.saveBatch(result.map(groupMemberMapper.dto2Entity), gid)
    return result
}


// 用於羣組成員索引表的數據接口
const getLocalMemberList = async (gid: number): Promise<GroupMemberItemVO[]> => {


    const items = await LocalGroupMemberService.findByIdWithoutTimeout(gid)
    return items.map(groupMemberMapper.entity2Dto)
}


const alphabetList = (items: GroupMemberItemVO[]) => {
    items.sort((a, b) => a.ai.charCodeAt(0) - b.ai.charCodeAt(0));
    const alphabet = [...new Set(items.map(item => item.ai))];
    const alphabetIndex: { [key: string]: number } = {}
    alphabet.forEach((item) => {
        alphabetIndex[item] = items.findIndex((i) => i.ai === item);
    })
    return {
        alphabet,
        alphabetIndex
    };
}

const create = async (name: string, avatar: string, isEnc: boolean, searchType: string, describe: string, cover: string) => {
    if (!globalThis.wallet) {
        throw new Error('請先登錄');
    }

    const groupPassword = generateUtil.generateId()

    const myWallet = globalThis.wallet
    const sharedSecret = myWallet?.computeSharedSecret(myWallet.getPublicKey())
    const enc_key = quickCrypto.En(sharedSecret, Buffer.from(groupPassword, 'utf8'));

    const group: GroupCreateReq =
    {
        avatar: avatar,
        name: name,
        isEnc: isEnc ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
        type: 1,
        banType: 0,
        searchType: Number(searchType),
        encPri: '',
        encKey: Buffer.from(enc_key).toString('hex'),
        describe: describe,
        cover: cover
    }
    const { id } = await groupApi.create(group);
    group.id = id
    return group;
}

/**
 * 創建羣后的邀請加入
 * @param members
 * @param groupInfo
 * @returns
 */
const invite = async (members: {
    id: number,
    pubKey: string
}[], groupInfo: { groupPassword: string, id: number }) => {
    if (!globalThis.wallet) {
        return;
    }
    const myWallet = globalThis.wallet
    // const sharedSecret = wallet?.computeSharedSecret(myWallet.getPublicKey())
    // const groupPassword = quickAes.De(groupInfo.encKey, sharedSecret ?? '');
    const items: {
        uid: number;
        encPri: string
        encKey: string;
    }[] = [];
    members.forEach(member => {
        const itemSecretKey = wallet?.computeSharedSecret(member.pubKey ?? '')
        const enkey = quickCrypto.En(itemSecretKey ?? '', Buffer.from(groupInfo.groupPassword ?? '', 'utf8'));
        items.push({
            uid: Number(member.id),
            encPri: myWallet.getPublicKey(),
            encKey: Buffer.from(enkey).toString('hex'),
        })
    })
    if (items.length > 0) {
        await groupApi.inviteJoin({
            id: groupInfo.id,
            items: items,
        })
    }
    return true;
}
// 申請加入羣組
const apply = async (gid: string) => {
    return true;
}
// 同意加入羣組
const agree = async (id: string) => {

    return true;
}
// 拒絕加入羣組
const refuse = async (id: string) => {
    return true;
}
// 管理員拒絕加入羣組
const adminRefuse = async (id: string) => {

    return true;
}
// 獲取羣組列表
const getList = async () => {
    return groupApi.mineGroupList({});
}
// 獲取羣組成員列表
const getMembers = async (id: string) => {
    const data = await groupApi.getGroupMembers({
        id,
        limit: 100,
        page: 1
    })
    return data.items;
}

const batchSaveLocal = async (data: GroupDetailItem[]) => {
    await LocalGroupService.saveBatch(data.map(c => groupMapper.dto2Entity(c)))
}

const getMemberPage = async (param: GroupMembersReq): Promise<GroupMemberResp> => {
    const data = await groupApi.getGroupMembers(param)
    return data;
}

const join = async (id: number, remark: string): Promise<GroupRequireJoinResp> => {
    return groupApi.requireJoin({ id, encKey: '', encPri: '', remark: remark });
}
const myApplyList = async (ids: string[] = []) => {
    return groupApi.myApplyList({ ids });
}
// 待審覈列表
const applyList = async (ids: number[] = [], reqUserIds?: number[]): Promise<GroupApplyItem[]> => {
    const result = await groupApi.applyList({ ids, uids: reqUserIds });
    const members = result.items ?? []
    const uids = members.map(m => m.uid)
    const userHash = await userService.getUserHash(uids)
    members.forEach(m => {
        const user = userHash.get(m.uid)
        if (user) {
            m.avatar = user?.avatar
            m.name = user.nickName
            m.address = user.userName
            m.pubKey = user.pubKey
        }
    })
    return members
}
// 拒絕加入
const rejectJoin = async (id: number, uids: number[]) => {
    return groupApi.rejectJoin({ id, uids, encKey: '' });
}

// 允許加入羣聊
const adminAgree = async (params: { id: number, uid: number, encPri: string, encKey: string }) => {
    return groupApi.agreeJoin(params);
}

const adminAdd = async (param: GroupManagerChangeReq) => {
    return groupApi.addAdmin(param)
}

const adminRemove = async (param: GroupManagerChangeReq) => {
    return groupApi.removeAdmin(param)
}

const groupSingleInfo = async (ids: number[]) => {
    const result = new Map<number, GroupSingleItem>()
    if (ids.length <= 0) {
        return result
    }
    const groups = await groupApi.groupSingleInfo({ ids: ids })
    if (groups.items && groups.items.length > 0) {
        groups.items.forEach(g => {
            result.set(g.id, g)
        })
    }
    return result
}

// 剔出羣聊
const kickOut = async (params: {
    id: number;
    uids: number[];
}) => {
    return groupApi.kickOut(params);
}

const saveTag = async (param: GroupTagReq) => {
    return groupApi.saveGroupTag(param)
}
const clearGroupMessages = async (groupIds: number[], chatIds: string[]) => {
    await LocalMessageService.deleteMessageByChatIdIn(chatIds)
    return groupApi.clearGroupMessages({ ids: groupIds })
}

export default {
    quit,
    quitAll,
    create,
    getList,
    getMembers,
    getMemberList,
    getLocalMemberList,

    alphabetList,
    join,
    myApplyList,
    applyList,
    invite,
    rejectJoin,

    kickOut,
    getMineList,
    getMemberPage,
    adminAdd,
    adminRemove,
    adminAgree,
    saveTag,
    clearGroupMessages,
    queryByIdIn,
    searchGroup,
    checkAndRefresh,
    queryLocalByIdIn
}
