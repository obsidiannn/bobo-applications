import { IModel } from "@repo/enums";

export interface ChatListItem {
	id: string;
	chatId: string;
	isTop: number;
	isMute: number;
	isShow: number;
	isHide: number;
	maxReadSeq: number;
	lastOnlineTime: number;
};

export interface ChatSequenceItem {
	chatId: string
	firstSequence: number
	lastReadSequence: number
	lastSequence: number
	lastTime: number
	isTop: number
	isMute: number
}

export interface ChatSnapshot {
	id: string
	lastReadSequence: number;
	lastSequence: number;
	lastTime: number
}

export interface ChatDetailItem {
	id: string;
	creatorId: string;
	type: IModel.IChat.IChatTypeEnum;
	status: number;
	isEnc: number;
	lastReadSequence: number;
	lastSequence: number;
	firstSequence: number
	lastTime: number;
	createdAt: number;
	avatar: string
	sourceId: number
	chatAlias: string
	isTop: number
	// 免打扰 1-是 0-否 默认0
	isMute: number
	describe?: string
};

export interface ChatRaiseTopReq {
	chatId: string
	top: boolean
}

export interface ChatConfigItem {
	isTop: number
	isMute: number
}