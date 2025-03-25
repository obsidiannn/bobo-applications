import { BaseIdReq, BasePageReq, BasePageResp } from "./common.js";

export interface GroupCreateReq {
	id?: number
	avatar: string;
	name: string;
	isEnc: number;
	type: number;
	banType: number;
	searchType: number;
	encPri: string
	encKey: string
	describe: string
	cover?: string
	// joinPrice: number
};

export interface GroupSingleItem {
	id: number
	name: string
	avatar: string
	chatId: string
}

export interface GroupMemberListReq {
	id: number
	isAdmin?: boolean
	uids?: number[]
}

export interface GroupMemberItem {
	id: number;
	uid: number;
	groupId: number;
	role: number;
	myAlias: string;
	aliasIdx: string
	adminAt: number;
	createdAt: number;
	status: number
	// 這倆只有自己纔有
	// encKey: string
	// encPri: string
};


export interface GroupMemberItemVO {
	id: number  // 這是user Id 
	uid: number
	// myAlias: string
	// aliasIdx: string
	// 這倆只有自己纔有
	role: number
	status: number
	groupId: number
	// member alias 或者 user nickname ，優先member alia
	groupAlias: string
	// member alias idx 或者 user nickname idx ，優先 member alias idx
	groupAliasIdx: string
	avatar: string
	name: string;
	nameIndex: string
	gender: number
	pubKey: string;
	sign: string;
	createdAt: number
}

export interface GroupMembersReq extends BasePageReq {
	id: number
}

export interface GroupMemberResp extends BasePageResp<GroupMemberItem> {

}

export interface GroupIdsReq {
	gids?: string[]
}

export interface GroupListIdResp {
	groupId: number,
	encKey: string,
}

export interface GroupInviteJoinItem {
	uid: number,
	encKey: string
	encPri: string
}

// 审核群加入申请
export interface GroupApplyJoinReq {
	id: number,
	uids: number[]
	encKey: string
}

export interface GroupInviteJoinReq {
	id:number,
	items: GroupInviteJoinItem[]
}

export interface GroupRequireJoinReq  {
	id: number
	encKey: string
	encPri: string
	remark?: string
}

export interface GroupRequireJoinResp {
	gid: string
	status: number
	err?: string
}

export interface GroupKickOutReq {
	id: number,
	uids: number[]
}

export interface GroupManagerChangeReq {
	id: number,
	uids: number[]
}

export interface GroupChangeNameReq {
	id: number,
	name: string
}
export interface GroupChangeAvatarReq {
	id: number,
	avatar: string
}

export interface GroupChangeAliasReq {
	id: number,
	alias: string
}


export interface GroupChangeNoticeReq {
	id: string;
	notice: string;
	notice_md5: string;
}
export interface GroupChangeDescReq {
	id: string;
	desc: string;
	desc_md5: string;
}

export interface GroupTransferReq {
	id: string;
	uid: string;
}

export interface GroupTagReq {
	gid: number
	tags: number[]
}

export interface GroupInfoDto {
	id: string
	name: string
	avatar: string
	memberLimit: number
	total: number
	pubKey: string
	desc: string
	isEnc: string
}

export interface GroupInfoItem {
	id: number;
	gid: string;
	uid: string;
	encKey: string;
	role: number;
	status: number;
	createdAt: number;
	pubKey: string
}

export interface GroupApplyListReq {
	ids: number[],
	uids?: number[]
}

export interface GroupApplyItem {
	id: string;
	gid: number;
	uid: number;

	encKey: string;
	role: number;
	status: number;
	createdAt: number;
	pubKey: string
	avatar?: string
	name?: string
	remark?: string
	address?: string
}

export interface MineGroupInfoItem {
	id: string;
	gid: string;
	status: number;
	created_at: number;
}


export interface GroupDetailItem {
	id: number;
	name: string;
	avatar: string;
	createdAt: number;
	memberLimit: number;
	total: number;
	pubKey: string;
	ownerId: number;
	creatorId: number;
	notice: string;
	desc: string;
	cover: string;
	isEnc: number;
	type: number;
	banType: number;
	searchType: number;
	status: number;
	role: number
	tags?: string
	encKey: string
	encPri: string
	chatId: string
	joinAt: number
};

export interface GroupDetailResp {
	items: GroupDetailItem[];
	status: number
}

// 群分类列表
export interface GroupCategoryListParams {
	id: string;
}
// 群分类结构
export interface GroupCategoryListItem {
	id: number;
	name: string;
	checked: boolean;
}

//
