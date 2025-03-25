

/**
 * 字符串省略
 * @param str 
 * @param maxLength 
 * @param ellipsis 
 * @returns 
 */
const truncateMiddle = (str: string, maxLength: number, ellipsis = '...'): string => {
    if (!str || str.length <= maxLength) {
        return str;
    }

    // 计算前后各保留多少字符
    const charsToShow = maxLength - ellipsis.length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    // 截断字符串前后部分并添加省略符
    const truncatedString = str.substring(0, frontChars) + ellipsis + str.substring(str.length - backChars);
    return truncatedString;
}

const defaultLabel = (val: string, defaultVal: string) => {
    if (val && val !== '') {
        return val
    }
    return defaultVal
}

export default {
    truncateMiddle,
    defaultLabel
}