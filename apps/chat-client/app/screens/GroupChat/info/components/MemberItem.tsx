import { s } from "app/utils/size";
import { Image } from "expo-image";
import { Text, TouchableOpacity } from "react-native";

export default (props: {
    avatar: string;
    onPress?: () => void;
    text?: string;
}) => {
    return <TouchableOpacity onPress={props.onPress} style={{
        display: 'flex',
        alignItems: 'center',
        marginRight: s(10),
        marginTop: s(10),
    }}>
        <Image source={props.avatar} style={{
            width: s(50),
            height: s(50),
            borderRadius: s(25),
            borderWidth: 1,
            borderColor: '#F0F0F0',
        }} />
        <Text numberOfLines={1} style={{
            fontSize: s(12),
            fontWeight: '400',
            color: '#666',
            marginTop: s(7),
        }}>{props.text}</Text>
    </TouchableOpacity>
}
