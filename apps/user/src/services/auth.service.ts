import { getInstance } from "@/lib/cache";
import { faker } from "@faker-js/faker";
import { CachePlus } from "@repo/server/cache";
import { HTTPException } from "hono/http-exception";
import { UserService } from "./user.service";
import { getFirstLetterOfPinyin } from "@repo/server/str-util";
import {IModel} from "@repo/enums";
import { EventService } from "./event.service";
export class AuthService {
    private cache: CachePlus;
    private static instance: AuthService;
    constructor(cache: CachePlus){
        this.cache = cache;
    }
    static async make(){
        if(!AuthService.instance){
            const cache = new CachePlus('auth', await getInstance())
            AuthService.instance = new AuthService(cache)
        }
        return AuthService.instance
    }
    static async signUp(addr: string,pubKey: string) {
        const instance = await AuthService.make();
        const cacheKey = `wait-reg-${addr}`;
        const oldCache = await instance.cache.get<string>(cacheKey);
        if (oldCache) {
          throw new HTTPException(409, { message: "已经存在" });
        }
        await instance.cache.set(cacheKey, "1000", 600000);
        const old = await UserService.findByAddr(addr);
        if (old) {
          throw new HTTPException(409, { message: "已经存在" });
        }
        const nickName = faker.person.fullName();
        const user = await UserService.add({
          addr,
          gender: IModel.IUser.Gender.UNKNOWN,
          nickName,
          pubKey,
          avatar: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=" + addr,
          nickNameIdx: getFirstLetterOfPinyin(nickName),
          userName: addr,
        });
        // 发起 注册事件
        // await EventService.broadcastRegister(user.id);
        await instance.cache.del(cacheKey);
        return user;
    }
}