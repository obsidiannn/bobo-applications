import { ViewStyle } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import WebView from "react-native-webview";
import { ThemeState } from "app/stores/system";
import { useRecoilValue } from "recoil";
import { App } from "types/app";
import { ScreenX } from "app/components/ScreenX";
type Props = StackScreenProps<App.StackParamList, 'WebViewScreen'>;
export const WebViewScreen = ({ route }: Props) => {
    const $theme = useRecoilValue(ThemeState);

    return (
        <ScreenX theme={$theme} title={route.params.title}>
            <WebView style={$container} source={{ uri: route.params.url }} />
        </ScreenX>
    );
};
const $container: ViewStyle = {
    flex: 1,
    width: '100%',
}