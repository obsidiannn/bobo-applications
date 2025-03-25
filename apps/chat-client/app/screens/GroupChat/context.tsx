import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import { createContext } from "react";


export interface GroupChatUiContextType {
	group: GroupDetailItem
	members: GroupMemberItemVO[]
	selfMember: GroupMemberItemVO
	chatItem: ChatDetailItem
	reloadMember: (groupId: number) => Promise<void>
	reloadMemberByUids: (groupId: number, uids: number[]) => Promise<void>
	reloadGroup: (groupId: number) => Promise<GroupDetailItem>
	reloadChat: (chat: ChatDetailItem) => void
}

export const GroupChatUiContext = createContext({} as GroupChatUiContextType)