export class GroupService{
    static async create(){
        // 创建成功后存入本地
    }
    static async update(){
        // 更新成功后存入本地
    }
    static async quitById(id: number){
        return GroupService.quitByIds([id]);
    }
    static async quitByIds(ids: number[]){
        // 删除本地的群数据 及 对应会话数据
        return true;
    }
    static async quitAll(){
        // 删除本地的群数据 及 对应会话数据
        return true;
    }
    static async findById(id: number){
    }
    static async getList(){
        // 分页取出云端的群id列表
    }
    static async findByIds(ids: number[]){
        // 取出未过期的数据
        // 从云端获取
        // 更新本地数据
    }
}