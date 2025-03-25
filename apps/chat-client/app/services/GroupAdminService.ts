export class GroupAdminService {
    static async kickOut(groudId: number,uids: string[]) {
    }
    static async flushMessage(groudId: number){
        // 删除云端所有消息及关联
        // 向所有群成员分发 删除本地数据任务
    }
    // 添加管理员
    static async addAdmin(groudId: number,uids: string[]) {
    }
    static async delAdmin(groudId: number,uids: string[]) {
    }
    // 待审核列表
    static async getInviteList(groudId: number) {
    }
    // 拒绝加入
    static async refuseInvite(groudId: number,uids: string[]) {
    }
    static async acceptInvite(groudId: number,uids: string[]) {
    }
    static async adminInvite(groudId: number,uids: string[]) {
        // 管理员邀请 用户同意后直接进群
    }
}