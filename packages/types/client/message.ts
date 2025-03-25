import { IModel } from "@repo/enums";
import { ChatDetailItem } from "./chat";

export interface MessageSendReq {
	id: string;
	chatId: string;
	content: string;
	type: number;
	isEnc: number;
	receiveIds?: string[];
	extra?: MessageExtra
	action?: MessageAction
}
export interface MessageSendResp {
	sequence: number;
	id: string;
	fromUid: string;
	content: string;
}

export interface MessageListReq {
	chatId: string
	sequence: number
	direction: string
	limit: number
}

export interface MessageListItem {
	id: string;
	msgId: string;
	isRead: number;
	sequence: number;
	createdAt: Date;
};

export type MessageExtra = {
	id?: string
	remark?: string
	replyId?: string
	replyAuthorName?: string
};

export type MessageAction = {};

export interface MessageDetailReq {
	chatId: string
	ids: string[]
}

export interface MessageDetailItem {
	id: string;
	chatId: string;
	fromUid: number;
	fromUidType: number
	content: string;
	status: number;
	type: number;
	isEnc: number;
	sequence: number;
	extra: MessageExtra;
	action: MessageAction;
	createdAt: string;
};

export interface MessageDeleteByIdReq {
	chatIds: string[]
}

export interface MessageDeleteByMsgIdReq {
	msgIds: string[]
}

export interface IEvent {
	type: IModel.IClient.SocketTypeEnum
}

export interface SocketMessageEvent extends IEvent {
	channel: string
	dateMills: number
	senderId: number
	sequence: number
	type: number
	metadata: any
}


export interface ClearChatMessageEvent extends IEvent {
	chatId: string
}

export interface DeleteMessageEvent extends IEvent {
	msgIds: string[]
}

export interface FriendChangeEvent extends IEvent {
	friendId: number,
	remove: boolean
}

/**
 * 会话的变更
 */
export interface ChatChangeEvent extends IEvent {
	chatId: string,
	item?: ChatDetailItem
	operate: 'add' | 'remove' | 'update'
}


export interface SocketJoinEvent extends IEvent {
	chatIds: string[]
}

export interface ChatTypingEvent extends IEvent {
	chatId: string
	flag: boolean
	senderId: number
}