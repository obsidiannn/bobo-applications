import * as grpc from '@grpc/grpc-js';
import { protos } from '@repo/grpc/proto';
import dayjs from 'dayjs';
import JsonBigInt from 'json-bigint'
import { GroupService } from '@/services/group.service';
import { GroupMemberService } from '@/services/group-member.service';
import { Group } from '@prisma/db-group'
const dateVal = (d: Date | null): bigint => {
    return d ? BigInt(dayjs(d).unix()) : 0n
}

const transformGroup = (group: Group): protos.group.Group => {
    return {
        id: BigInt(group.id),
        name: group.name,
        avatar: group.avatar ??'',
        memberLimit: group.memberLimit,
        total: group.total,
        ownerId: BigInt(group.ownerId),
        creatorId: BigInt(group.creatorId),
        createdAt: dateVal(group.createdAt),
        notice: group.notice ??'',
        desc: group.desc??'',
        cover: group.cover,
        type: group.type,
        status: group.status
    }
}
export const findGroupByIds = async (call: grpc.ServerUnaryCall<protos.group.FindGroupsByIdsRequest, protos.group.GroupListResponse>, callback: grpc.sendUnaryData<protos.group.GroupListResponse>) => {
    const request = call.request;
    const groupService = await GroupService.make()
    const groupMemberService = await GroupMemberService.make()
    const groups = await groupService.findByIds(request.ids)
    const groupMembers = await groupMemberService.memberCountByGroupIds(request.ids)

    callback(null, {
        items: groups.map(e => {
            const item = transformGroup(e)
            const count = groupMembers.get(e.id)
            if(count){
                item.total = count
            }
            return item
        })
    });
}