import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    UserCenterScreen,
    PlazaScreen,
    ChatScreen
} from '../../screens/index'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTab } from './BottomTab';
import { Header } from './Header';
import { View } from 'react-native';
import { App } from 'types/app';
import { $colors } from 'app/Colors';

export default () => {
    const insets = useSafeAreaInsets();
    const Stack = createBottomTabNavigator<App.StackParamList>();
    return <Stack.Navigator screenOptions={{
        headerShown: true,
        header: (props) => <Header {...props} />
    }} initialRouteName="ChatScreen" tabBar={(props) => {
        return <View style={{
            padding: 0,
            paddingBottom: insets.bottom,
            backgroundColor: $colors.slate950
        }}>
            <BottomTab {...props} />
        </View>
    }}>
        <Stack.Screen name="PlazaScreen" component={PlazaScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="UserCenterScreen" component={UserCenterScreen} />
    </Stack.Navigator>
}