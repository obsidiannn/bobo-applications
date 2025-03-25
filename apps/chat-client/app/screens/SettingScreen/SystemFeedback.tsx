import { StackScreenProps } from "@react-navigation/stack";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilValue } from "recoil";
import { App } from "types/app";
import { SysCategoryItem } from "@repo/types";
import { IconFont } from "app/components/IconFont/IconFont";
import SystemCategoryModal, { SystemCategoryModalType } from "./SystemCategoryModal";
import app from "app/api/sys/app";
import { IModel } from "@repo/enums";
import LoadingModal, { LoadingModalType } from "app/components/loading-modal";
import fileService from "app/services/file.service";
import { AuthService } from "app/services/auth.service";
import toast from "app/utils/toast";
import { pickerImages } from "app/utils/media-util";
import { Image } from "expo-image";
import { Button } from "app/components";
import { ScreenX } from "app/components/ScreenX";
import { useTranslation } from "react-i18next";
type Props = StackScreenProps<App.StackParamList, 'SystemFeedbackScreen'>;
export const SystemFeedbackScreen = (props: Props) => {

    const [category, setCategory] = useState<SysCategoryItem | null>(null)
    const [categories, setCategories] = useState<SysCategoryItem[]>([])
    const [content, setContent] = useState<string>('')
    const themeColor = useRecoilValue(ColorsState)
    const systemCategoryModalRef = useRef<SystemCategoryModalType>(null)
    const [images, setImages] = useState<string[]>([])
    const loadingModalRef = useRef<LoadingModalType>(null)
    const style = styles({ themeColor })
    const { t } = useTranslation("screens")
    const doSubmit = async () => {
        if (!category) {
            toast(t('feedback.labelChooseCategory'))
            return
        }
        loadingModalRef.current?.open()
        try {
            let urls: string[] = []
            if (images.length > 0) {
                for (let index = 0; index < images.length; index++) {
                    const i = images[index];
                    if (i.startsWith("file://")) {
                        const u = await fileService.uploadImage(i)
                        if (u) {
                            urls.push(u)
                        }
                    } else if (i.startsWith('http') || i.startsWith('tmp/')) {
                        urls.push(i)
                    }
                }
                console.log('urls', urls);

                setImages(urls)
            }
            const id = await AuthService.doFeedback(category.id, urls, content)
            if (id) {
                toast('操作成功')
            }
        } catch (error) {

        } finally {
            loadingModalRef.current?.close()
        }

    }
    useEffect(() => {
        app.getCategories({
            type: IModel.ISystem.CategoryType.FEEDBACK
        }).then(res => {
            setCategories(res.list)
        })
    }, [])
    const $theme = useRecoilValue(ThemeState);
    return <ScreenX title="意见反馈" theme={$theme}>
        <View style={{
            flex: 1,
            marginTop: s(32),
            padding: s(12),
        }}>
            <View style={style.categoryLine}>
                <Text style={{
                    fontSize: s(16), color: themeColor.text
                }}>
                    所属分类
                    <Text style={{
                        fontSize: s(12), color: themeColor.secondaryText
                    }}>(必填)
                    </Text>
                </Text>
                <TouchableOpacity style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center'
                }} onPress={() => {
                    systemCategoryModalRef.current?.open()
                }}>
                    <Text style={{ color: themeColor.secondaryText }}>
                        {
                            category === null ? '请选择分类' : category.name
                        }
                    </Text>
                    <IconFont name="arrowRight" color={themeColor.secondaryText} size={16} />
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: s(12), backgroundColor: themeColor.background, }}>
                <TextInput
                    value={content}
                    placeholder="请仔细描述你的问题"
                    placeholderTextColor={themeColor.secondaryText}
                    style={{
                        padding: s(8),
                        color: themeColor.text
                    }}
                    cursorColor={themeColor.text}
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={200}
                    onChangeText={(v) => {
                        setContent(v)
                    }}
                />
                <Text style={{
                    textAlign: 'right',
                    color: themeColor.secondaryText
                }}>
                    {content.length} / {200}
                </Text>
            </View>

            <View style={style.imageContainer}>
                {
                    images.map((i, idx) => {
                        return <Image source={fileService.getFullUrl(i)}
                            key={'img_' + idx}
                            style={style.imageItem} />
                    })
                }
                <TouchableOpacity
                    onPress={() => {
                        // captureImage()
                        pickerImages(9).then(res => {
                            setImages(res.map(r => r.uri))
                        })
                    }}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeColor.secondaryBackground,
                        width: s(84),
                        height: s(84),
                        borderRadius: s(12)
                    }}>
                    <IconFont name="plus" color={themeColor.secondaryText} />
                    <Text style={{
                        color: themeColor.secondaryText
                    }}>照片 ({images.length}/{9})</Text>
                </TouchableOpacity>
            </View>
            <Button label="提交反馈" size="large"
                onPress={doSubmit}
                fullRounded fullWidth
                containerStyle={{
                    backgroundColor: themeColor.primary, bottom: 0
                }} />
        </View>
        <SystemCategoryModal
            ref={systemCategoryModalRef}
            onChoose={(item: SysCategoryItem) => { setCategory(item) }}
            list={categories} />
        <LoadingModal ref={loadingModalRef} />
    </ScreenX>
}


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(8),
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    categoryLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeColor.secondaryBackground,
        borderRadius: s(12),
        padding: s(12)
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: s(24), flex: 1
    },
    imageItem: {
        width: s(64), height: s(64),
        marginRight: s(8),
        marginBottom: s(8)
    }
})
