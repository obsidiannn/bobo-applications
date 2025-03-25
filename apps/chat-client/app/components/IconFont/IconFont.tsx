import { s } from 'app/utils/size';
import { ColorValue, View, ViewStyle } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';
const glyphMap = {
    pencil: 0x0020,
    person: 0x0021,
    picture: 0x0022,
    planet: 0x0023,
    play: 0x0024,
    plus: 0x0025,
    power: 0x0026,
    qrcode: 0x0027,
    quit: 0x0028,
    logout: 0x0029,
    quote: 0x002a,
    redPacket: 0x002b,
    remove: 0x002c,
    restart: 0x002d,
    safety: 0x002e,
    safetyKey: 0x002f,
    scan: 0x0030,
    searchDoc: 0x0031,
    send: 0x0032,
    setting: 0x0033,
    share: 0x0034,
    smile: 0x0035,
    transfer: 0x0036,
    trash: 0x0037,
    unlock: 0x0038,
    userAdd: 0x0039,
    userGroup: 0x003a,
    userProfile: 0x003b,
    version: 0x003c,
    video: 0x003d,
    women: 0x003e,
    about: 0x003f,
    arrowLeft: 0x0040,
    arrowRight: 0x0041,
    bill: 0x0042,
    book: 0x0043,
    camera: 0x0044,
    chart: 0x0045,
    chatTop: 0x0046,
    chat: 0x0047,
    circleClose: 0x0048,
    clearDoc: 0x0049,
    close: 0x004a,
    copy: 0x004b,
    doc: 0x004c,
    docs: 0x004d,
    download: 0x004e,
    edit: 0x004f,
    ellipsis: 0x0050,
    eye: 0x0051,
    eyeClose: 0x0052,
    file: 0x0053,
    flashLight: 0x0054,
    language: 0x0055,
    like: 0x0056,
    location: 0x0057,
    lock: 0x0058,
    men: 0x0059,
    multipleSelection: 0x005a,
    newChat: 0x005b,
    notificationOff: 0x005c,
    notification: 0x005d,
    checkMark: 0x005e,
    search: 0x005f,
    userSetting: 0x0060,
    userRemove: 0x0061,
    silent: 0x0062,
};
export type IconFontNameType = keyof typeof glyphMap;
export const IconFontNames = Object.keys(glyphMap) as IconFontNameType[];
const Icon = createIconSet(glyphMap, 'BoboIcon', 'BoboIcon.ttf');

export interface IconFontProps {
    name: IconFontNameType;
    size?: number;
    color: ColorValue;
    backgroundColor?: string;
    border?: boolean;
    borderRadius?: number;
    borderColor?: string;
    containerStyle?: ViewStyle;
}
export const IconFont = (props: IconFontProps) => {
    const { border = false, backgroundColor, borderColor, borderRadius = 10, color = "white", size = 32 } = props;

    return <View style={[
        {
            backgroundColor: backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            width: s(size),
            height: s(size),
        },
        border && {
            borderRadius: s(borderRadius),
            borderColor: borderColor,
            borderWidth: 1,
        },
        props.containerStyle,
    ]}>
        <Icon name={props.name} size={s(size)} color={color} />
    </View>
}

