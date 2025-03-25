import { createInstance } from "../req";
// 修改昵称
const updateUserName = async (userName: string): Promise<null> => await createInstance(true).post('/auth/update/userName', {userName});

// 修改头像
const updateAvatar = async (avatar: string): Promise<null>  => await createInstance(true).post('/auth/update/avatar', {avatar});

// 修改性别
const updateGender = async (gender: number): Promise<null>  => await createInstance(true).post('/auth/update/gender', {
    gender,
})

// 修改签名
const updateSign = async (sign: string): Promise<null>  =>await createInstance(true).post('/auth/update/sign', {sign})
const updateNickName = async (nickName: string): Promise<null>  => await createInstance(true).post('/auth/update/nickName', {nickName})



export default {
    updateNickName,
    updateSign,
    updateGender,
    updateAvatar,
    updateUserName
}