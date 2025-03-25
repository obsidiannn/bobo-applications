import { IGroupMember } from "drizzle/schema"
import { GroupMemberItemVO } from "../../../../packages/types/dist/client/group"
import { IModel } from "@repo/enums"
import dayjs from "dayjs"
const dto2Entity = (dto: GroupMemberItemVO): IGroupMember => {
    const entity: IGroupMember = {
        id: dto.id,
        uid: dto.uid,
        role: dto.role,
        status: dto.status,
        groupId: dto.groupId,
        groupAlias: dto.groupAlias,
        groupAliasIdx: dto.groupAliasIdx,
        avatar: dto.avatar,
        nickName: dto.name,
        nickNameIdx: dto.nameIndex,
        gender: dto.gender,
        pubKey: dto.pubKey,
        sign: dto.sign,
        createdAt: dayjs().unix(),
        refreshAt: dayjs().unix(),
    }
    return entity
}

const entity2Dto = (entity: IGroupMember): GroupMemberItemVO => {
    const dto: GroupMemberItemVO = {
        id: entity.id,
        uid: entity.uid ?? 0,
        role: entity.role ?? 0,
        status: entity.status ?? 0,
        groupId: entity.groupId ?? 0,
        groupAlias: entity.groupAlias ?? '',
        groupAliasIdx: entity.groupAliasIdx ?? '',
        avatar: entity.avatar ?? '',
        name: entity.nickName ?? '',
        nameIndex: entity.nickNameIdx ?? '',
        gender: entity.gender ?? IModel.IUser.Gender.UNKNOWN,
        pubKey: entity.pubKey ?? '',
        sign: entity.sign ?? '',
        createdAt: entity.createdAt ?? 0
    }
    return dto
}

export default {
    dto2Entity,
    entity2Dto
}