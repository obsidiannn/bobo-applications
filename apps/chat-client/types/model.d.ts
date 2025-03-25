declare namespace Model{
    interface IUser {
        id: number;
        addr: string | null;
        avatar: string | null;
        pubKey: string | null;
        gender: number | null;
        nickName: string | null;
        nickNameIdx: string | null;
        userName: string | null;
        sign: string | null;
        createdAt: Date | null;
        updatedAt?: Date | null;
    }
}