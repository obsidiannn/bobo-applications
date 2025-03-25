import { colors } from "app/theme"
import { s } from "app/utils/size"
import { ImageStyle } from "expo-image"
import { View, ViewStyle } from "react-native"
import { NetworkImage } from "./NetworkImage";

export interface AvatarXProps {
    uri: string;
    online?: boolean;
    border?: boolean;
    size?: number;
}

const AvatarX = (props: AvatarXProps) => {
    const { border = false, size = 48, online = false, uri } = props;
    return <View style={$container} >
        <View style={[
            (border ? $border : null),
            {
                borderRadius: s(size),
                overflow: 'hidden'
            }
        ]}>
            <NetworkImage uri={uri} style={[$avatar, { width: s(size), height: s(size) }
                , (border ? {
                    borderRadius: s(size),
                } : null)
            ]} />
        </View>
        {
            online ?
                <View style={[
                    $badge,
                    { backgroundColor: '#00D32D' }
                ]}>
                </View> : null
        }
    </View>

}
const $container: ViewStyle = {
    flexDirection: 'row',
    display: 'flex'
}
const $border: ViewStyle = {
    display: 'flex',
    borderWidth: s(3),
    borderStartColor: 'red',
    borderEndColor: '#890084',
    borderTopColor: '#8A0184',
    borderBottomColor: 'green',
}
const $avatar: ImageStyle = {
    display: 'flex',
    justifyContent: 'center',
};
const $badge: ViewStyle = {
    position: 'relative',
    bottom: 0,
    right: 15,
    alignSelf: 'flex-end',
    padding: s(6),
    borderColor: '#ffffff',
    borderWidth: s(2),
    borderRadius: s(12),
    backgroundColor: colors.palette.gray400,
};

export default AvatarX
