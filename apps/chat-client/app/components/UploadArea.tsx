import { ReactNode, useRef } from "react";
import { ImageBackground, Pressable, TouchableOpacity, ViewStyle } from "react-native";
import BottomOptionModal, { BottomOptionModalType } from "./BottomOptionModal"
import { useTranslation } from 'react-i18next';
import { chooseImage } from "app/services/file.service";
import { s } from "app/utils/size";

export const UploadArea = (props: {
    url: string
    onChange: (v: string) => void
    children: ReactNode
    style?: ViewStyle
}) => {
    const { t } = useTranslation('components')
    const bottomOptionModalRef = useRef<BottomOptionModalType>();
    const options = [
        {
            title: t('upload.label_camera'),
            onPress: () => {
                chooseImage(true, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    console.log(uri);

                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
        {
            title: t('upload.label_pick_album'),
            onPress: () => {
                chooseImage(false, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
    ];
    return <>
        <Pressable style={{
            borderRadius: s(15),
            borderWidth: 1,
            borderStyle: 'dashed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            maxHeight: s(240),
            ...props.style
        }} onPress={() => {
            bottomOptionModalRef.current?.open();
        }}>
            {
                (props.url && props.url !== '') ?
                    <ImageBackground
                        style={{
                            width: '100%', height: '100%',
                        }} source={{ uri: props.url }} /> :
                    props.children
            }

        </Pressable>
        <BottomOptionModal ref={bottomOptionModalRef} items={options} />
    </>
}

