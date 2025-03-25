import dayjs from "dayjs"
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween);
const second2Label = (second: number, patten: string = "YYYY-MM-DD hh:mm"): string => {
    if (second <= 0) {
        return ''
    }
    return dayjs(second * 1000).format(patten)
}
/**
 * 
 * @param mills 是否为本周
 * @returns 
 */
const inCurrentWeek = (mills: number): boolean => {
    const isWeekStar = dayjs().startOf("week")
    const isWeekEnd = dayjs().endOf("week")
    // 判断是否本周内  周几 hh:mm
    return dayjs(mills).isBetween(isWeekStar, dayjs(isWeekEnd))
}

const inCurrentMonth = (mills: number): boolean => {
    const monthStart = dayjs().startOf("month")
    const monthEnd = dayjs().endOf("month")
    // 判断是否本周内  周几 hh:mm
    return dayjs(mills).isBetween(monthStart, dayjs(monthEnd))
}

export default {
    second2Label,
    inCurrentWeek,
    inCurrentMonth
}