import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { ResizeMode, Video } from 'expo-av'
import { MessageType } from "./chat-ui";
import BaseModal from "./base-modal";
import fileService from "app/services/file.service";
import { s } from "app/utils/size";
import toast from "app/utils/toast";

export interface IVideoPreviewModal {
    open: (params: {
        encKey: string;
        video: MessageType.Video;
    }) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState<string>('');
    const videoRef = useRef(null)
    const loadVideo = useCallback(async (message: MessageType.Video, sharedKey: string) => {
        const uri = message.uri
        const original = message.metadata?.original ?? null
        console.log('message', message);

        if (!uri || !original) {
            toast('數據異常')
            return
        }
        // if (original && original.startsWith('file://')) {
        //     if (await fileService.checkExist(original)) {
        //         console.log('使用原始文件', original);
        //         setData(original)
        //         return
        //     }
        // }
        console.log('視頻預覽', uri);
        setData(fileService.getFullUrl(uri))
    }, [])

    const handlePlayStatusUpdate = (playStatus: any) => {
        if (playStatus.didJustFinish) {
            videoRef.current?.setPositionAsync(0)
            videoRef.current?.pauseAsync()
        }
    }

    useImperativeHandle(ref, () => ({
        open: (params: {
            encKey: string;
            video: MessageType.Video;
        }) => {
            (async () => {
                setVisible(true);
                try {
                    await loadVideo(params.video, params.encKey)
                } finally {
                }
            })()
        }
    }));

    const close = () => {
        if (videoRef.current) {
            videoRef.current?.unloadAsync()
        }
        setVisible(false)
        setData('')
    }


    return <BaseModal visible={visible} onClose={close} title={'视频预览'} styles={{flex: 1}}>
        <Video
            ref={videoRef}
            resizeMode={ResizeMode.COVER}
            style={styles.videoStyle}
            source={{ uri: data, type: 'mp4' }}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={handlePlayStatusUpdate}
            volume={1.0}
            rate={1.0}
        />
    </BaseModal>
});

var styles = StyleSheet.create({
    loadingStyle: {
        fontSize: s(30),
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    videoStyle: {
        margin: 0,
        padding: 0,
        flex: 1,
    },
});
