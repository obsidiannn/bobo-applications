import { ColorValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { ChatUiToolsKitProps } from "../../types";
import { s, verticalScale, vs } from "app/utils/size";
import { colors } from "app/theme";
import { IconFont } from "app/components/IconFont/IconFont";

export interface InputToolsProps {
    tools?: ChatUiToolsKitProps[];
    backgroundColor?: ColorValue
    color: ColorValue
    onPress: (tool: ChatUiToolsKitProps) => void;
}
export default (props: InputToolsProps) => {
    const { tools, onPress } = props;
    return <View style={[styles.container]}>
        {(tools ?? []).map((tool, i) => {
            return <TouchableOpacity onPress={() => onPress(tool)} key={tool.key} style={{
                ...styles.item,
                marginTop: i > 3 ? vs(10) : 0,

            }}>
                <View style={{
                    backgroundColor: props.backgroundColor ?? colors.palette.gray400,
                    padding: s(4),
                    borderRadius: s(12)
                }}>
                    <IconFont name={tool.icon} color={props.color} />
                </View>
                {/* <Image style={styles.icon} source={tool.icon} /> */}
                <Text style={styles.title}>{tool.title}</Text>
            </TouchableOpacity>
        })}
    </View>
}
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: s(10),
        paddingVertical: vs(20),
        backgroundColor: colors.palette.gray200,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: vs(12),
        display: 'flex',
        flexDirection: 'column',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: s(46),
        height: vs(46),
        borderRadius: s(10),

    },
    title: {
        color: '#52525b',
        fontSize: s(12),
        marginTop: s(4),
        textAlign: 'center',
        marginVertical: verticalScale(5),
    }
});
