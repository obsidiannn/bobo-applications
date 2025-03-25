import { s } from "app/utils/size"
import { Image } from "expo-image"
import { Text, View,Platform, Pressable } from "react-native"

export interface BannerProperty {
    label: string
    describe: string
    onPress: () => void
}

const BannerComponent = (props: BannerProperty) => {

    return <Pressable onPress={props.onPress} style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: s(12),
        ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
            },
            android: {
              elevation: 10,
            },
          }),
    }}>
        <View style={{
            marginHorizontal: s(16)
        }}>
            <Text style={{fontSize: s(18),fontWeight: 500,marginBottom: s(4)}}>{props.label}</Text>
            <Text style={{fontSize: s(16),color: '#777777'}}>{props.describe}</Text>
        </View>
        <Image source={require('assets/images/banner.png')}
            contentFit="contain"
            style={{
                height: s(66),
                aspectRatio:1.6
            }}
        />
    </Pressable>
}

export default BannerComponent
