import { globalStorage } from "./kv-tool";
import ToastException from "app/exception/toast-exception";
import Crypto from 'react-native-quick-crypto';
import { globalKV } from "app/utils/kv-tool";
import quickCrypto from "./quick-crypto";

const STORAGE_KEY = 'account-data';
export const passwordHash = (password: string) => {
    const bin = passwordToBin(password);
    return {
        top: Buffer.from(bin.top).toString("hex"),
        bottom: Buffer.from(bin.bottom).toString("hex")
    }
}
export const passwordToBin = (password: string) => {
    const hash = new Uint8Array(Crypto.createHash('sha256').update(password).digest());
    return {
        top: hash.slice(0, 16),
        bottom: hash.slice(16, 32)
    };
}
export const binToPasswordHash = (bin: Uint8Array) => Buffer.from(bin).toString('hex')
export const initContainer = () => {
    const items: Array<Uint8Array> = []
    for (let i = 0; i < 10; i++) {
        items.push(new Uint8Array(100))
    }
    return items;
}

export const loadContainer = () => {
    const accountData = globalStorage.get('string',STORAGE_KEY);
    if (!accountData) {
        return initContainer();
    }
    const blob = new Uint8Array(Buffer.from(accountData as string, 'hex'));

    const items: Array<Uint8Array> = []
    for (let i = 0; i < blob.length; i += 100) {
        items.push(blob.slice(i, i + 100))
    }
    return items;
}
export const setNow = (priKey: string) => {
    return globalKV.set("now-pri-key",priKey)
}
export const getNow = () => {
    return globalKV.get("string","now-pri-key") as string | undefined;
}
export const dump = () => {
    const items = loadContainer();
    return Buffer.concat(items).toString('hex');
}
export const clear = () =>{
    globalStorage.del(STORAGE_KEY)
    globalKV.del("now-pri-key")
}
export const quit = () =>{
    globalKV.del("now-pri-key")
}
export const writePriKey = async (password: string, priKey: string) => {
    if(priKey.startsWith('0x')){
        priKey = priKey.substring(2)
    }
    const items = loadContainer();
    const pwdBin = passwordToBin(password);
    const pwdHash = passwordHash(password);
    const passwordHashList: string[] = [];
    for (const item of items) {
        if (item[0] == 1) {
            passwordHashList.push(binToPasswordHash(item.slice(2, 18)));
        }
    }
    if (passwordHashList.includes(pwdHash.top)) {
        throw new ToastException('密码已被占用');
    }
    const priKeyBuffer = new Uint8Array(Buffer.from(priKey, "hex"))
    const enData = quickCrypto.En(pwdHash.bottom, priKeyBuffer);
    let isWrite = false
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[0] == 0) {
            item[0] = 1;
            item[1] = enData.length;
            for (let j = 2; j < 18; j++) {
                item[j] = pwdBin.top[j - 2];
            }
            for (let j = 30; j < enData.length + 30; j++) {
                item[j] = enData[j - 30];
            }
            // 填充剩余的值
            for (let j = enData.length + 30; j < 100; j++) {
                item[j] = Math.floor(Math.random() * 249);
            }
            items[i] = item;
            isWrite = true;
            break;
        }
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if(item[0] == 0) {
            for (let j = 1; j < item.length; j++) {
                if (item[j] == 0) {
                    item[j] = Math.floor(Math.random() * 249);
                }
            }
            items[i] = item;
        }
    }
    if (isWrite) {
        globalStorage.set(STORAGE_KEY, Buffer.concat(items).toString("hex"));
        return true;
    }
    throw new ToastException("账号达到上限");
}
export const dropPriKey = async (password: string) => {
    const items = loadContainer();
    const pwdHash = passwordHash(password);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[0] == 1) {
            const oldPwdHash = binToPasswordHash(item.slice(2, 18));
            if (oldPwdHash == pwdHash.top) {
                items[i] = new Uint8Array(100);
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        for (let j = 1; j < item.length; j++) {
            if (item[j] == 0) {
                item[j] = Math.floor(Math.random() * 249);
            }
        }
    }
    globalStorage.set(STORAGE_KEY, Buffer.concat(items).toString("hex"));
    return true;
}
export const readPriKey = (password: string) => {
    const items = loadContainer();
    let priKey = '';
    const pwdHash = passwordHash(password);
    for (const item of items) {
        if (item[0] == 0) {
            continue;
        }
        const pwdBin = item.slice(2, 18);
        if (pwdBin.length !== 16) {
            throw new Error('pwd length error');
        }
        const oldPwdHash = binToPasswordHash(pwdBin);
        if (oldPwdHash === pwdHash.top) {
            const deData = quickCrypto.De(pwdHash.bottom, item.slice(30, item[1] + 30))
            priKey = Buffer.from(deData.slice(0, 32)).toString("hex");
            break;
        }
    }
    if (priKey) {
        return "0x" + priKey;
    } else {
        throw new ToastException('账号不存在');
    }
}
export const getAccountTotal = () => {
    let total = 0;
    const items = loadContainer();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if(item[0] == 1){
            total += 1;
        }
    }
    return total;
}

export const restore = (content: string) => {
    const buffer = Buffer.from(content, 'hex');
    if(buffer.length != 1000){
        throw new Error("错误的备份文件");
    }
    return globalStorage.set(STORAGE_KEY, content);
}

export const isOnline = (refreshAt: number) => {
    return true;
}