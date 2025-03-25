import * as ImagePicker from 'expo-image-picker';
// import PhotoEditor from "@baronha/react-native-photo-editor";
import * as DocumentPicker from 'expo-document-picker';
import { requestCameraPermission, requestPhotoPermission } from 'app/services/permissions';

import { Video, createVideoThumbnail, Image } from 'react-native-compressor';


export const pickerDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
    });
    if (!result.canceled) {
        return result.assets;
    }
    return [];
}
export const pickerImage = async (): Promise<ImagePicker.ImagePickerAsset[]> => {
    await requestPhotoPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        base64: true,
        allowsMultipleSelection: true,
        quality: 1,
    });
    if (!result.canceled) {
        return result.assets;
    }
    return [];
};

export const pickerImages = async (max: number): Promise<ImagePicker.ImagePickerAsset[]> => {
    await requestPhotoPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        base64: true,
        allowsMultipleSelection: true,
        selectionLimit: max,
        quality: 1,
    });
    if (!result.canceled) {
        return result.assets;
    }
    return [];
};

export const captureImage = async () => {
    await requestCameraPermission();
    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        quality: 1,
    });

    if (!result.canceled) {
        // const s = await PhotoEditor.open({
        //     stickers: [],
        //     path: result.assets[0].uri,
        // })
        // result.assets[0].uri = s.toString()
        return result.assets[0]
    }
}

export const captureVideo = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    await requestCameraPermission();
    // await requestMicrophonePermission();

    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        exif: false,
        quality: 1,
        videoMaxDuration: 15,
    });
    if (!result.canceled) {
        return result.assets[0]
    }
    return null;
};

export const imageFormat = async (input: string) => {
    const result = await Image.compress(input);
    return result
}

export const videoFormat = async (asset: ImagePicker.ImagePickerAsset): Promise<ImagePicker.ImagePickerAsset | null> => {
    const result = await Video.compress(
        asset.uri,
        {},
        (progress) => {
            console.log('Compression Progress: ', progress);
        }
    );
    if (result) {
        // SUCCESS
        asset.uri = result
        return asset
    }
    return null;
}

/**
 * 生成視頻縮略圖
 * @param videoPath 視頻地址
 * @param mid 消息主鍵
 * @returns 
 */
export const generateVideoThumbnail = async (videoPath: string, mid: string) => {
    const thumbnail = await createVideoThumbnail(videoPath)
    return thumbnail.path
    // const thumbnailPath = FileSystem.cacheDirectory + mid + '_thumbnail.jpg'
    // const cmd = `-i ${videoPath} -ss 00:00:01 -vframes 1 ${thumbnailPath}`
    // const session = await FFmpegKit.execute(cmd)
    // if (ReturnCode.isSuccess(await session.getReturnCode())) {
    //     return thumbnailPath;
    // }
    // return null
}