import { IServer } from "@repo/types";
import FriendItem from "app/components/FriendItem";
import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenX } from "app/components/ScreenX";
import fileService from "app/services/file.service"
import friendService from "app/services/friend.service";
import userService from "app/services/user.service";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useRecoilValue } from "recoil";

export const AddFriendScreen = () => {
    const $theme = useRecoilValue(ThemeState)
    const themeColor = useRecoilValue(ColorsState)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState<IServer.IFriend[]>([]);
    const { t } = useTranslation('screens')
    const search = useCallback(async (v: string, l: boolean) => {
        if (!v) {
            return;
        }
        if (loading) {
            return;
        }
        setLoading(true);
        const user = await userService.findByUserName(v);
        if (user) {
            console.log('userRelations', "请求关系");
            const userRelations = await friendService.getReleationList([user.id])
            console.log('userRelations', userRelations);

            if (userRelations.items) {
                const userRelation = userRelations.items.find(item => item.userId == user.id);
                console.log('userRelation', userRelation);
                if (userRelation) {
                    setFriends([
                        {
                            id: user.id,
                            avatar: fileService.getFullUrl(user.avatar ?? ''),
                            friendId: 0,
                            remark: user.nickName ?? '',
                            remarkIdx: user.nickNameIdx ?? '',
                            relation: 1,
                            relationStatus: userRelation.status,
                            chatId: '',
                            addr: user.addr ?? '',
                            updateAt: user.updatedAt?.valueOf() ?? 0,
                        }
                    ])
                }
            }

        }
        return () => {
            setLoading(false)
        }
    }, [])
    return <ScreenX title={t('friend.add_friend_title')} theme={$theme} >
        <View style={{
            ...styles.mainContainer,
            backgroundColor: themeColor.background
        }}>
            <View style={{
                ...styles.queryView,
                backgroundColor: themeColor.secondaryBackground,
            }}>
                <TextInput
                    underlineColorAndroid='transparent'
                    style={{
                        ...styles.input,
                        color: themeColor.text
                    }}
                    onSubmitEditing={() => {
                        if (!keyword) {
                            return;
                        }
                        search(keyword, true)
                    }}
                    returnKeyLabel={t('friend.label_search')}
                    returnKeyType="search"
                    onChangeText={(v) => {
                        setKeyword(v)
                    }}
                    cursorColor={themeColor.text}
                    value={keyword}
                />
                <Pressable style={{

                }} onPress={() => {
                    console.log('search');
                    search(keyword, false)
                }}>
                    <IconFont name="search" color={themeColor.secondaryText} size={26} />
                </Pressable>
            </View>

            <ScrollView style={styles.contentContainer}>
                {friends.map((item, i) => <FriendItem isLast={i == (friends.length - 1)} item={item} key={item.id} />)}
            </ScrollView>
        </View>
    </ScreenX>
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: s(12),
        display: 'flex',
        marginTop: s(24),
        borderTopLeftRadius: s(32),
        borderTopRightRadius: s(32)
    },

    queryView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: s(36),
        paddingVertical: s(12),
        paddingRight: s(24),
        paddingLeft: s(14),
    },
    input: {
        width: '85%',
        fontSize: 16,
        fontWeight: '500',
        marginRight: s(4),
        paddingLeft: s(12)
    },
    contentContainer: {
        flex: 1,
        paddingTop: s(15),
    },
})
