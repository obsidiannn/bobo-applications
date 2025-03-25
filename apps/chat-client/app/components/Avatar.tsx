import { colors } from "app/theme"
import { s } from "app/utils/size"
import { Image, ImageStyle } from "expo-image"
import { ViewStyle } from "react-native"
import { View } from "react-native"

export interface AvatarProps {
    url: string
    online?: boolean
    style?: ImageStyle
    border?: boolean
    size: number
}

export const AvatarComponent = (props: AvatarProps) => {
    return <View style={$container} >
        <Image source={props.url} style={[
            $avatar,
            props.style && {...props.style},
            props.border && {...$border},
            {
                width: s(props.size),
                height: s(props.size),
                borderRadius: s(props.size/2)
            }
        ]} />
        {
            props.online !== undefined ?
                <View style={{
                    ...$badgeContainer,
                    ...(props.online ? {
                        backgroundColor: '#00D32D'
                    } : {})
                }}>
                </View> : null
        }
    </View>

}
const $container:ViewStyle  = {
    flexDirection: 'row',
        display: 'flex',
}

const $avatar:ImageStyle = {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: s(24),
}
const $badgeContainer:ViewStyle={
    position: 'relative',
    bottom: 0,
    right: 15,
    alignSelf: 'flex-end',
    padding: s(6),
    borderColor: '#ffffff',
    borderWidth: s(2),
    borderRadius: s(12),
    backgroundColor: colors.palette.gray400,
}
const $border:ImageStyle = {
    borderWidth: s(3),
}
export default AvatarComponent
