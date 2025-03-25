import Crypto from 'node:crypto';
import { pinyin } from "pinyin-pro";
export const getHashKey = (vals: Array<string | number | bigint>) => {
    return Crypto.createHash('md5').update(vals.map(String).join(',')).digest('hex');
}

export const generateId = () => {
    return Buffer.from(Crypto.randomBytes(12)).toString("hex");
};

export const generateRef = (userIds: bigint[]): string => {
    const ids = userIds.map(Number).sort((a, b) => a - b)
    console.log('[ids]', ids);

    const userRef = ids.join(",");
    return strMd5(userRef);
};

export const strMd5 = (str: string): string => {
    return Crypto.createHash("md5").update(str).digest("hex");
};

/**
 * 获取文本的首字母
 * @param word 
 * @returns 
 */
export const getFirstLetterOfPinyin = (word: string): string => {
    const result = pinyin(word.charAt(0), {
        type: "array",
        toneType: "none",
    }).map((i) => (i[0] ?? '').toUpperCase());
    return result[0] ?? ''
};

/**
 * 分页计算
 * @param page 
 * @param limit 
 * @returns 
 */
export const pageSkip = (
    page: number | undefined,
    limit: number | undefined
): number => {
    if (page === null || page === undefined) {
        page = 1;
    }
    if (limit === null || limit === undefined) {
        limit = 10;
    }
    return (page - 1) * limit;
};


/**
 * 求数组差集
 * @param arr1 [0,1,2]
 * @param arr2 [1,2]
 * @returns [0]
 */
export const arrayDifference = (arr1: any[], arr2: any[]): any[] => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const difference = Array.from(new Set([...set1].filter((x) => !set2.has(x))));
    return difference;
};



/**
 * 随机切分数字为n份
 * @param n
 * @param total
 * @returns
 */
export const randomSplit = (n: number, total: number): number[] => {
    const res: number[] = []; // 最后返回的数组
    let range = total; // 生成随机金额的范围
    let preTotal = 0; // 已经生成的金额的和
    for (let i = 0; i < n - 1; i++) {
        const item = Math.ceil(Math.random() * (range / 2));
        res.push(item);
        range -= item; // 从范围内减去已经生成的金额
        preTotal += item; // 将已经生成的金额进行累加
    }
    res.push(total - preTotal); // 最后将剩下的金额添加到数组中
    return res;
};


/**
 * 随机数组下标
 * @param length
 * @returns index
 */
export const randomIndex = (length: number): number => {
    return Math.floor(Math.random() * length);
};


/**
 * 日期转秒级时间戳
 * @param val 
 * @returns 
 */
export const dateSecondConvert = (val: string | Date | undefined): number => {
    if (!val)
        return 0
    if (typeof val === 'string') {
        return Math.floor(new Date(val).valueOf() / 1000)
    } else {
        const v = val as Date
        return Math.floor(v.valueOf() / 1000)
    }
}

export const hashValueDefault = <T>(
    k: any,
    hash: Map<any, any>,
    defaultValue: T
): T => {
    const v = hash.get(k);
    if (v === null) {
        return defaultValue;
    }
    return v;
};

