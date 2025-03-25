import { UserInfoItem } from "./user";

export interface AuthCheckRegisterResp {
	isRegister: number;
};

export interface AuthRegisterResp{
	user: UserInfoItem
};


export interface AuthChangeNameReq{
	name: string;
};
export interface AuthChangeAvatarReq{
	avatar: string;
};
export interface AuthChangeGenderReq{
	gender: number;
};
export interface AuthChangeSignReq{
	sign: string;
};

export interface AuthBlackListItem{
  uid: string;
  createdAt: number;
};

export interface AuthBlackReq{
  uid: string;
};

export interface UpdateMessageTokenReq {
	token: string
}