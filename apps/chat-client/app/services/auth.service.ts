import { Wallet } from "app/utils/wallet"
import authApi from 'app/api/auth/auth';
import { LocalUserService } from "./LocalUserService";
import updateApi from "app/api/auth/update";
import fileService from "./file.service";
export class AuthService {
    static GetWallet = (): Wallet => {
        if (!global.wallet) {
            throw new Error('wallet not found');
        }
        return global.wallet;
    }
    static signUp = async () => {
        const user = await authApi.signUp();
        await LocalUserService.add(user);
        return user;
    }
    static getInfo = async () => {
        const user = await authApi.getInfo();
        await LocalUserService.add(user);
        return user;
    }

    static updateUserName = async (userName: string): Promise<void> => {
        await updateApi.updateUserName(userName);
    }

    static updateNickName = async (nickName: string): Promise<void> => {
        await updateApi.updateNickName(nickName);
    }

    static updateGender = async (gender: number): Promise<void> => {
        await updateApi.updateGender(gender);
    }

    static updateSign = async (sign: string): Promise<void> => {
        await updateApi.updateSign(sign);
    }

    static updateAvatar = async (path: string): Promise<string | null> => {
        const remotePath = await fileService.uploadImage(path)
        if (remotePath) {
            await updateApi.updateAvatar(remotePath);
            return remotePath
        }
        return null
    }

    static doComplain = async (urls: string[], userId: number, content?: string): Promise<number | null> => {
        const resp = await authApi.doComplain({
            userId, content, imageUrls: urls
        })
        if (resp) {
            return resp.id
        }
        return null
    }


    static doFeedback = async (categoryId: number, urls: string[], content: string): Promise<number | null> => {
        const resp = await authApi.doFeedback({
            categoryId, content, imageUrls: urls
        })
        if (resp) {
            return resp.id
        }
        return null
    }

}