import { s, verticalScale } from "app/utils/size";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../Button";
import Checkbox from "expo-checkbox";

export default (props: {
    onConfirm: () => void;
    checkedAll: boolean;
    onCheckedAllChange: (value: boolean) => void;
    primary: string
}) => {

    return <View style={styles.container}>
        <Checkbox style={{
            borderRadius: s(15)
        }} color={props.primary} value={props.checkedAll} onValueChange={(value) => props.onCheckedAllChange(value)} />
        <Button label="完成" size="small" onPress={() => props.onConfirm()} />
    </View>
}
const styles = StyleSheet.create({
    container: {
        height: verticalScale(60),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(15),
    },
    button: {
        borderRadius: s(10),
        padding: s(16),
        height: s(32)
    },
    buttonLabel: {
        fontSize: s(14),
        fontWeight: '500',
    }
});
