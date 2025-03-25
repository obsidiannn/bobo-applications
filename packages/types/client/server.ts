export namespace IServer {
    export interface INode {
        addr: string;
        region: string;
        type: string;
    }
    export interface IAppVersion {
        versionCode: number;
        versionName: string;
        description: string;
        downloadUrl: string;
        forceUpdate: boolean;
    }
    export interface IUser {
        id: number;
        avatar: string;
        gender: number;
        nickName: string;
        nickNameIdx: string;
        pubKey: string;
        userName: string;
        sign: string;
        createdAt: number;
        addr: string
        updateAt: number
    }
    export interface IFriend  {
        id: number;
        avatar: string;
        friendId: number;
        remark: string;
        remarkIdx: string;
        relation: number;
        relationStatus: boolean; // 是否为好友
        chatId: string;
        addr: string
        updateAt: number
    }
    export interface IFriendApply {
        id: number;
        userId: number;
        friendId: number;
        status: number;
        createdAt: number;
        updatedAt: number;
        remark?: string;
        rejectReason?: string;
    }
}