import { IFriendApplies } from "drizzle/schema";
import { IServer } from "../../../../packages/types/dist/client/server";

const dto2Entity = (dto: IServer.IFriendApply): IFriendApplies => {
    return {
        id: dto.id,
        userId: dto.userId,
        friendId: dto.friendId,
        status: dto.status,
        remark: dto.remark ?? '',
        rejectReason: dto.rejectReason ?? "",
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    }
}


export default {
    dto2Entity
}