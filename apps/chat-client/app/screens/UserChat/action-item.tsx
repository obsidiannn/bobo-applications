
import { ColorValue, StyleSheet, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { s } from "app/utils/size";


export default (props: {
    style?: ViewStyle;
    textColor?: string;
    title: string;
    rightComponent?: ReactNode;
    leftComponent?: ReactNode
    onPress?: () => void;
    backgroundColor?: ColorValue
}) => {
    return <TouchableWithoutFeedback onPress={props.onPress} >
        <View style={[styles.container, props.style]}>
            {props.leftComponent}
            <Text style={{
                ...styles.text,
                color: props.textColor ?? '#000',
            }}>{props.title}</Text>
            {props.rightComponent}
        </View>
    </TouchableWithoutFeedback>
};

const styles = StyleSheet.create({
    container: {
        height: s(50),
        borderRadius: s(14),
        paddingHorizontal: s(15),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#F4F4F4',
        // backgroundColor: '#F8F8F8',
    },
    text: {
        flex: 1,
        fontSize: s(15),
        fontWeight: '400',
    }
});
