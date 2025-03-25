/**
 * A "modern" sleep statement.
 *
 * @param ms The number of milliseconds to wait.
 */

import dayjs from 'dayjs'

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 获取n分钟之前的秒数
 * @param cacheMin 
 * @returns 
 */
export const delaySecond = (cacheMin?: number): number => {
    const cacheSeconds = cacheMin ?? 5 * 60
    const currentSecond = dayjs().unix()
    // console.log('currentSecond = ', currentSecond);

    return currentSecond - cacheSeconds
}