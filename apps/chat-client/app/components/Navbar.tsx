import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";
import { goBack } from "app/navigators";
import { s } from "app/utils/size";
import { IconFont } from "./IconFont/IconFont";
import { $colors } from "app/Colors";
const Navbar = (props: {
    onLeftPress?: () => void;
    renderRight?: () => React.ReactNode;
    renderLeft?: () => React.ReactNode;
    renderCenter?: () => React.ReactNode;
    title?: string;
    rightStyle?: ViewStyle;
    theme?: 'light' | 'dark';
    style?: ViewStyle;
}) => {
    const {
        title = '',
        onLeftPress = () => goBack(),
        renderLeft,
        renderCenter,
        renderRight,
        rightStyle
    } = props;
    const renderTitle = () => {
        if (renderCenter) {
            return <View style={[$centerContainer]}>
                {renderCenter()}
            </View>
        } else {
            return <View style={[$centerContainer]}>
                <Text style={[
                    $centerText,
                    {
                        color: props.theme == "dark" ? $colors.white : $colors.neutra600
                    },
                ]}>{title}</Text>
            </View>
        }
        return null
    }

    return <View style={[$container, {
        backgroundColor: props.theme == "dark" ? $colors.slate950 : $colors.neutra100,
    }, props.style]}>
        {<View style={$leftContainer}>
            {
                renderLeft ? renderLeft() : <Pressable style={[
                    $leftIconContainer,
                    {
                        backgroundColor: props.theme == "dark" ? $colors.slate800 : $colors.white
                    }
                ]} onPress={() => onLeftPress()}>
                    <IconFont name="arrowLeft" color={props.theme == "dark" ? $colors.white : $colors.black} size={14} />
                </Pressable>
            }
        </View>}
        {
            renderTitle()
        }
        {
            <View style={{
                ...$rightContainer,
                ...rightStyle
            }}>
                {renderRight ? renderRight() : null}
            </View>
        }
    </View>
}
const $container: ViewStyle = {
    height: s(46),
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
}
const $leftContainer: ViewStyle = {
    height: s(45),
    width: '20%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: s(16),
}
const $leftIconContainer: ViewStyle = {
    width: s(32),
    height: s(32),
    borderRadius: s(10),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}
const $centerContainer: ViewStyle = {
    height: s(44),
    width: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
const $centerText: TextStyle = {
    fontSize: 16,
    fontWeight: '500',
}
const $rightContainer: ViewStyle = {
    width: '20%',
    alignItems: 'center'
}
export default Navbar
