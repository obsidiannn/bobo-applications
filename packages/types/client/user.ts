export interface OfficialUserItem {
  id: number,
  name: string,
  nameIdx: string,
  avatar: string
  
}

export interface UserInfoItem{
  id: string;
  avatar: string;
  name: string;
  nameIndex: string
  gender: number
  pubKey: string;
  sign: string;
  userSequence: number
}

export interface UserInfoResp{
  items:UserInfoItem[]
}

export interface UserUIdInfo{
  id: string;
  uid: string;
}