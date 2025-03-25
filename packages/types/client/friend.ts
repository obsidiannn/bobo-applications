import { BasePageReq,BasePageResp } from "./common";


export interface FreindInfoReleationItem extends FriendRelationItem{
	name: string;
	sign: string;
	avatar: string;
	gender: number;
	pubKey: string
	chatId?: string
  }
export interface FriendRelationItem {
	uid: string;
	isFriend: number;
	chatId?:string
};

export interface FriendInviteApplyReq{
	uid: string;
	remark: string;
};


export interface FriendApplyListReq extends BasePageReq {
	reqUserId?: string
}

export interface FriendInviteApplyItem{
	id: number;
	uid: number;
	friendId: number
	remark: string;
	rejectReason: string;
	status: number;
	isSelf: boolean
	name?: string
	avatar?: string
};


export interface FriendInviteAgreeReq{
	id: string;
	alias: string;
};


export interface FriendInviteRejectReq{
	id: string;
	reason: string;
};

export interface FriendBasicInfo{
	uid: number;
	chatId: string;
	remark: string
	remarkIndex: string
}

export interface FriendInfo extends FriendBasicInfo {
	name: string
	nameIndex: string
	avatar: string
	pubKey: string
	gender: number;
}

export interface FriendInfoItem  {
	uid: string;
	chatId: string;
	remark: string
	remarkIndex: string
	name: string
	nameIndex: string
	gender: number;
	avatar: string;
	pubKey: string;
};

export interface FriendChangeAliasReq{
	id: string;
	alias: string;
};

