import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { View, Platform, Text } from "react-native";
import mime from 'mime/dist/src/index_lite';
import * as Sharing from 'expo-sharing';
import BaseModal from "./base-modal";
import { MessageType } from "./chat-ui";
import { colors } from "app/theme";
import { bytesToSize, s } from "app/utils/size";
import toast from "app/utils/toast";
import { Image } from "expo-image";
import { Button } from "./Button";
import fileService from "app/services/file.service";
import { useTranslation } from "react-i18next";

export interface ChatUIFileModalRef {
    open: (params: {
        encKey: string;
        file: MessageType.File;
    }) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [encKey, setEncKey] = useState("");
    const [file, setFile] = useState<MessageType.File>();
    const [localPath, setLocalPath] = useState('')
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const { t } = useTranslation('components')
    const downloadFile = useCallback(async (f: MessageType.File) => {
        const uri = f.uri
        const _localPath = await fileService.downloadFile(fileService.getFullUrl(uri));
        toast(t('file.labelDownloadSuccess'));
        setLocalPath(_localPath)
        setDownloaded(true);
    }, []);
    const saveFile = useCallback(async (f: MessageType.File) => {
        if (typeof f.uri == 'string') {
            // if (f.path.startsWith('http')) {
            //     return;
            // }
            // if (f.path.startsWith('file://')) {
            //     return;
            // }
        }

        if (Platform.OS == 'ios') {
            Sharing.shareAsync(localPath, {
                mimeType: mime.getType(localPath) ?? 'application/octet-stream',
            });
            return;
        } else {
            Sharing.shareAsync(localPath, {
                mimeType: mime.getType(localPath) ?? 'application/octet-stream',
            });
        }
    }, [])
    useImperativeHandle(ref, () => ({
        open: async (params: {
            encKey: string
            file: MessageType.File;
        }) => {
            if (await fileService.checkDownloadFileExists(fileService.getFullUrl(params.file.uri))) {
                const tempPath = fileService.urlToPath(fileService.getFullUrl(params.file.uri))
                setDownloaded(true)
                setLocalPath(tempPath)
            }
            console.log('file is ', params.file);
            console.log('name= ', params.file.name);
            setEncKey(params.encKey);
            setFile(params.file);
            setVisible(true);

        }
    }));

    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={t('file.title')} styles={{ flex: 1 }}>
        <View style={{
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: s(24),
        }}>
            <View style={{
                flex: 1,
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Image source={require('assets/icons/file-unknown.svg')} style={{
                    width: s(60),
                    height: s(60),
                    marginTop: s(72),
                }} />
                <Text style={{
                    fontSize: s(16),
                    color: 'black',
                    fontWeight: '600',
                    marginTop: s(24)
                }}>{file?.name}</Text>
                <Text style={{
                    fontSize: s(14),
                    color: '#999',
                    fontWeight: '400',
                    marginTop: s(10),
                }}>文件大小：{bytesToSize(file?.size ?? 0)}</Text>

            </View>
            <Button disabled={loading}
                fullWidth fullRounded
                size="large"
                onPress={() => {
                    if (loading) {
                        return;
                    }
                    if (!file) {
                        return;
                    }
                    setLoading(true);
                    if (downloaded) {
                        saveFile(file).finally(() => {
                            setLoading(false);
                        });
                    } else {
                        downloadFile(file).finally(() => {
                            setLoading(false);
                        });
                    }

                }} containerStyle={{
                    display: 'flex',
                    backgroundColor: colors.palette.primary,
                    marginBottom: s(24)
                }} label={
                    downloaded ? (loading ? '解密中' : '分享') : (loading ? '下載中' : '保存到本地')
                } loading={loading}>

            </Button>
        </View>
    </BaseModal>
});
