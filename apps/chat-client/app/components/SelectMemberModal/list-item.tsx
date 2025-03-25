import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { SelectMemberOption } from "./index";
import Checkbox from "expo-checkbox";
import { s } from "app/utils/size";


export default (props: {
    item: SelectMemberOption;
    index: number;
    isLast: boolean;
    onChange: (value: boolean) => void;
    primary: string
}) => {
    const { item, isLast, onChange } = props;
    return <View style={styles.container}>
        <Checkbox disabled={item.disabled} style={{
            marginRight: s(15),
            borderRadius: s(15)
        }} color={props.primary} value={item.status} onValueChange={(value) => onChange(value)} />
        <TouchableOpacity onPress={() => {
            if (!item.disabled) {
                onChange(!item.status)
            }
        }} style={{
            ...styles.rightContainer,
            borderBottomWidth: isLast ? 0 : 1,
        }}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    </View>
}
const styles = StyleSheet.create({
    titleContainer: {
        height: s(51),
        display: 'flex',
        justifyContent: 'center',
        paddingLeft: s(15),
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: s(66),
        paddingRight: s(26),
        paddingLeft: s(15),
    },
    rightContainer: {
        height: s(66),
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ECECEC',
    },
    icon: {
        width: s(40),
        height: s(40),
        borderRadius: s(20),
        borderColor: '#F0F0F0',
        borderWidth: 1,
        marginRight: s(10),
    },
    name: {
        fontSize: s(14),
        fontWeight: '500',
        color: '#333',
    }
});
