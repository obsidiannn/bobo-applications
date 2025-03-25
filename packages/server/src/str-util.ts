import { pinyin } from "pinyin-pro";


export const getFirstLetterOfPinyin = (word: string): string => {
    const result = pinyin(word, { pattern: 'first', toneType: 'none', type: 'array' });
    return result[0] ? result[0].toLowerCase() : '';
};