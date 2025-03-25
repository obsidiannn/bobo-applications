import { SIZE_BASE_WIDTH, SIZE_BASE_HEIGHT } from '@env';
import { max } from 'drizzle-orm';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

//Default guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = SIZE_BASE_WIDTH || 350;
const guidelineBaseHeight = SIZE_BASE_HEIGHT || 680;

export const scale = (size: number) => shortDimension / guidelineBaseWidth * size;
export const verticalScale = (size: number) => longDimension / guidelineBaseHeight * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
export const moderateVerticalScale = (size: number, factor = 0.5) => size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;


/**
 * 图片 等比例缩小
 * @param width 
 * @param height 
 * @returns 
 */
export const imageReduce = (width: number, height: number, maxWidth: number): { w: number, h: number } => {
    if (width <= 0 || height <= 0) {
        return { w: maxWidth, h: maxWidth }
    }
    let w = width, h = height
    if (width > maxWidth) {
        w = maxWidth
        h = (maxWidth * height) / width
    }
    return { w, h }
}


export const bytesToSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`;
}
