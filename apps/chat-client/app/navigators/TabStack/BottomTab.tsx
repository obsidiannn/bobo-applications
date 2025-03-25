import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View,ViewStyle } from "react-native";
import { s, vs } from "app/utils/size";
import { IconFont } from "app/components/IconFont/IconFont";
const $container:ViewStyle = {
    width: '100%',
    height: vs(60),
    flexDirection: 'row',
    borderTopWidth: s(1),
};
const $tabItem:ViewStyle = {
    flex: 1,
    height: vs(60),
    alignItems: 'center',
    justifyContent: 'center',
};
export function BottomTab({ state, descriptors, navigation }: BottomTabBarProps) {

    return (
        <View style={$container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };
                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };
                return (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        testID={options.tabBarButtonTestID}
                        onLongPress={onLongPress}
                        style={$tabItem}
                        key={index}
                    >
                        <View>
                            {route.name == 'PlazaScreen' && <IconFont name="planet" size={32} color={isFocused ? 'white' : '#617086'} />}
                            {route.name == 'ChatScreen' && <IconFont name="chat" size={32} color={isFocused ? 'white' : '#617086'} />}
                            {route.name == 'UserCenterScreen' && <IconFont name="person" size={32} color={isFocused ? 'white' : '#617086'} />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}