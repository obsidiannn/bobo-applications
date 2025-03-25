import { StackScreenProps } from "@react-navigation/stack";
import { navigate } from "app/navigators";
import { globalKV } from "app/utils/kv-tool";
import { useCallback, useEffect } from "react";
import { App } from "types/app";

/**
 * 跳转页面
 */
type Props = StackScreenProps<App.StackParamList, 'LinkScreen'>;
export const LinkScreen = ({ navigation, route }: Props) => {

    const initCheck = useCallback(async () => {
        const param = route.params
        console.log('route.param', route.params);

        if (param) {
            if (!param.url) {
                return
            }
            if (!global.wallet) {
                console.log('[link] not login');
                globalKV.set('link_param', JSON.stringify(param))
                navigate('Entry')
                return
            }
            if (param.from === 'link') {
                const url = param.url
                const parsedUrl = new URL(url);
                const pathname = parsedUrl.pathname.replace('/', '');
                const params = Object.fromEntries(new URLSearchParams(parsedUrl.search));
                console.log('[linkroute]', pathname);
                console.log('[linkparam]', params);
                const hostname = parsedUrl.hostname
                if (pathname === 'UserInfo') {
                    console.log('userinfo');

                    navigate('UserInfoScreen', { userId: params.id, outside: true })
                    // navigate('AuthStackNav', { screen: pathname, params: { userId: params.id, outside: true } })
                }
                if (pathname === 'GroupInfo') {
                    navigate('GroupInfoScreen', { id: params.id, outside: true })
                    // navigate('AuthStackNav', { screen: pathname, params: { id: params.id, outside: true } })
                }
                if (hostname === 'group') {
                    navigate('GroupInfoScreen', { id: pathname, outside: true })
                }
            }
            if (param.from === 'notify') {
                const url = param.url
                console.log('link notify');

                const parsedUrl = new URL(url);
                console.log('url==', parsedUrl.hostname);
                console.log(parsedUrl.protocol); // 'xx:'
                console.log(parsedUrl.hostname); // 'example.com'
                console.log(parsedUrl.pathname); // '/some/path'
                // const routeName = parsedUrl.hostname.replace('/', '');

                const pathname = parsedUrl.pathname.replace('/', '');
                const params = Object.fromEntries(new URLSearchParams(parsedUrl.search));
                console.log('[linkroute]', pathname);
                console.log('[linkparam]', params);

                if (params.id) {
                    if (pathname === 'UserChatUI') {
                        navigate('UserChatScreen', { chatId: params.id, fromNotify: true })
                    }
                    if (pathname === 'GroupChatUI') {
                        navigate('GroupChatScreen', { chatId: params.id, fromNotify: true })
                    }
                }
            }
        }
        // if (navigation.canGoBack()) {
        //     console.log('goback');

        //     navigation.goBack()
        // }
    }, [])
    useEffect(() => {
        initCheck()
    }, [])
    return <></>
}
