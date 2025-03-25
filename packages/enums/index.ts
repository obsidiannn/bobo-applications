export namespace IModel {
    export namespace ICommon {
        export enum ICommonBoolEnum {
            NO = 0,
            YES = 1,
        }
        export enum IActiveEnum {
            ACTIVE = 1,
            INACTIVE = 2,
        }
    }

    export namespace INode {
        export enum Status {
            ONLINE = 1,
            OFFLINE = 2,
        }
    }

    export namespace ISystem {
        export enum CategoryType {
            FEEDBACK = 1,
        }
    }

    export namespace IUser {
        export enum Gender {
            UNKNOWN = 1,
            MALE = 2,
            FEMALE = 3
        }
        export enum Status {
            NORMAL = 1,
            DISABLE = 2,
            DESTROY = 3
        }
    }
    export namespace IFriend {
        export enum Relation {
            BOTH_FRIENDS = 1,
            ONE_WAY_FRIEND = 2,
            BLOCKED = 3,
        }
    }
    export namespace IFriendApply {
        export enum Status {
            PENDING = 1,
            PASSED = 2,
            REJECT = 3,
        }
    }

    export namespace IChat {

        // 消息类型
        export enum IMessageTypeEnum {
            // 普通
            NORMAL = 1,
            APP = 2,
            // 转账
            REMIT = 3,
            //  红包
            RED_PACKET = 4,
            // 官方消息
            OFFICIAL_MESSAGE = 5,
        }

        export enum IMessageStatusEnum {
            DELETED = 0,
            NORMAL = 1,
            SEND_BACK = 2,
        }

        export enum IOfficialMessageTypeEnum {
            // 好友申请
            FRIEND_APPLY = 1,
            // 群组申请
            GROUP_APPLY = 2,
        }

        // 1-单聊 2-群聊 3 官方会话
        export enum IChatTypeEnum {
            NORMAL = 1,
            GROUP = 2,
            OFFICIAL = 3,
        }
        export enum IChatStatusEnum {
            ENABLE = 1,
            DISABLE = 2,
        }

        export enum IChatUserSourceFrom {
            USER = 1,
            OFFICIAL = 2,
        }

        export enum ITokenTypeEnum {
            FIREBASE = 1
        }

        /**
         * 发起消息的用户类型
         */
        export enum MessageUserType {
            DEFAULT = 1,
            OFFICIAL = 2,
        }
    }
    export namespace IGroup {
        export enum IGroupStatusEnum {
            ENABLE = 1,
            DISABLE = 2,
        }
        export enum IGroupMemberStatus {
            PENDING = 0,
            NORMAL = 1,
            REJECTED = 2,
        }
        export enum IGroupMemberRoleEnum {
            OWNER = 1,
            MANAGER = 2,
            MEMBER = 3,
        }
    }
    export namespace IPushJob {
        export enum Status {
            PENDING = 0,
            PROCESSING = 1,
            SUCCESS = 2,
            FAILED = 3,
        }
    }
    export namespace IEvent {
        export enum Status {
            PENDING = 0,
            PROCESSING = 1,
            SUCCESS = 2,
            FAILED = 3,
        }
    }
    export namespace IClient {
        export enum SocketTypeEnum {
            MESSAGE = 0,
            CLEAR_ALL_MESSAGE = 2,
            DELETE_MESSAGE = 3,
            SOCKET_JOIN = 4,
            GLOBAL_MESSAGE = 5,
            FRIEND_CHANGE = 6,
            CHAT_CHANGE = 7,
            TYPING_CHANGE = 8,
            RECIEVE_TYPING_CHANGE = 9
        }
    }
}   