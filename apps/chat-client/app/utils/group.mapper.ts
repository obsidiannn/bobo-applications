import { IGroup } from "drizzle/schema"
import { GroupDetailItem } from "../../../../packages/types/dist/client/group"
import { IModel } from "@repo/enums"

const dto2Entity = (dto: GroupDetailItem): IGroup => {
    const entity: IGroup = {
        id: dto.id,
        name: dto.name,
        avatar: dto.avatar,
        createdAt: dto.createdAt,
        memberLimit: dto.memberLimit,
        total: dto.total,
        ownerId: dto.ownerId,
        creatorId: dto.creatorId,
        notice: dto.notice,
        desc: dto.desc,
        cover: dto.cover,
        isEnc: dto.isEnc,
        type: dto.type,
        banType: dto.banType,
        searchType: dto.searchType,
        status: dto.status,
        role: dto.role,
        tags: dto.tags ?? '',
        encKey: dto.encKey,
        encPri: dto.encPri,
        chatId: dto.chatId,
        refreshAt: 0,
        joinAt: dto.joinAt
    }
    return entity
}

const entity2Dto = (entity: IGroup): GroupDetailItem => {
    const dto: GroupDetailItem = {
        id: entity.id,
        name: entity.name ?? '',
        avatar: entity.avatar ?? '',
        createdAt: entity.createdAt ?? 0,
        memberLimit: entity.memberLimit ?? 100,
        total: entity.total ?? 0,
        ownerId: entity.ownerId ?? 0,
        creatorId: entity.creatorId ?? 0,
        notice: entity.notice ?? '',
        desc: entity.desc ?? '',
        cover: entity.cover ?? '',
        isEnc: entity.isEnc ?? IModel.ICommon.ICommonBoolEnum.YES,
        type: entity.type ?? 0,
        banType: entity.banType ?? IModel.ICommon.ICommonBoolEnum.NO,
        searchType: entity.searchType ?? IModel.ICommon.ICommonBoolEnum.YES,
        status: entity.status ?? IModel.ICommon.ICommonBoolEnum.YES,
        role: entity.role ?? -1,
        tags: entity.tags ?? '',
        encKey: entity.encKey ?? '',
        encPri: entity.encPri ?? '',
        chatId: entity.chatId ?? '',
        joinAt: entity.joinAt ?? 0
    }
    return dto
}

export default {
    dto2Entity,
    entity2Dto
}