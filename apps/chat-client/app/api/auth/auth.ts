
import { IUser } from "drizzle/schema";
import { createInstance } from "../req";
import dayjs from "dayjs";
const signUp = async (): Promise<IUser> => {
    const rep: {
        user: any
    } = await createInstance(true).post('/auth/signup')
    rep.user.createdAt = dayjs(rep.user.createdAt).toDate();
    return rep.user as IUser;
}


const destory = async (): Promise<null> => await createInstance(true).post('/auth/destroy')
const getInfo = async (): Promise<IUser> => {
    const rep: {
        user: any
    } = await createInstance(true).post('/auth/info');
    rep.user.createdAt = dayjs(rep.user.createdAt).toDate();
    return rep.user as IUser;
};

const doComplain = async (
    param: {
        userId: number,
        content?: string,
        imageUrls: string[]
    }
): Promise<{ id: number }> => {
    const rep: {
        id: number
    } = await createInstance(true).post('/auth/complain', param);
    return rep;
}

const doFeedback = async (
    param: {
        categoryId: number,
        content: string,
        imageUrls: string[]
    }
): Promise<{ id: number }> => {
    const rep: {
        id: number
    } = await createInstance(true).post('/auth/feedback', param);
    return rep;
}

export default {
    signUp,
    destory,
    getInfo,
    doComplain,
    doFeedback
}