import { ChatDetailItem } from "@repo/types";
import { IUser } from "drizzle/schema";
import { createContext } from "react";

export interface UserChatUIContextType {
    friend: IUser | null
    chatItem: ChatDetailItem
    reloadChat: (item: ChatDetailItem) => void
    reloadUser: (item: IUser) => void
}

export const UserChatUIContext = createContext({} as UserChatUIContextType)