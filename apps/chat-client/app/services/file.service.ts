
import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermission, requestDirectoryPermission, requestPhotoPermission } from './permissions';
import s3Api from '../api/sys/s3';

import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import crypto from 'react-native-quick-crypto';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { imageFormat } from 'app/utils/media-util';
import { SystemService } from './system.service';


export interface ChooseImageOption {
    aspect?: [number, number],
    quality: number,
}

export interface EncodeFileResult {
    path: string
    md5: string
    enc_md5: string
}

export const chooseMultipleImage = async (isCamera: boolean, option: ChooseImageOption, multiple: boolean = true, isEdit: boolean = false): Promise<string[] | null> => {
    if (multiple) {
        isEdit = false;
    }
    const params = {
        ...option,
        allowsEditing: isEdit,
        exif: false,
        chooseMultipleImage: multiple,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
    }
    if (!isCamera) {
        await requestPhotoPermission()
        const result = await ImagePicker.launchImageLibraryAsync(params);
        if (!result.canceled) {
            return result.assets.map(item => item.uri)
        }
        return null;
    }
    await requestCameraPermission();
    const result = await ImagePicker.launchCameraAsync(params);
    if (!result.canceled) {
        return result.assets.map(item => item.uri)
    }
    return null;
}

const isExist = async (path: string): Promise<boolean> => {
    const info = await FileSystem.getInfoAsync(path)
    return info.exists
}

export const chooseImage = async (isCamera: boolean, option: ChooseImageOption): Promise<string | null> => {
    const images = await chooseMultipleImage(isCamera, option, false, true);
    if (images && images.length > 0) {
        return images[0];
    }
    return null;
}

export const uploadFile = async (uri: string): Promise<{
    uploadUrl: string;
    key: string;
}> => {

    const mimeType = mime.getType(uri) ?? 'application/octet-stream';

    return new Promise(async (resolve, reject) => {
        const rep = await s3Api.getUploadPreSignUrl()
        try {
            const response = await FileSystem.uploadAsync(rep.uploadUrl, uri, {
                httpMethod: 'PUT',
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                headers: {
                    ContentType: mimeType ?? ''
                }
            });
            if (!response) {
                reject(new Error('上傳失敗'));
            }
            response?.status === 200 ? resolve(rep) : reject(new Error('上傳失敗'));
        } catch (error) {
            reject(error)
        }
    })

};


/**
 * 上傳本地圖片，不加密
 * @param localImage 
 * @returns 
 */
export const uploadImage = async (localImage: string) => {
    if (localImage.startsWith('file:/')) {
        const manipResult = await manipulateAsync(
            localImage,
            [
                { resize: { width: 200 } },
            ],
            { compress: 1, format: SaveFormat.JPEG }
        );
        const webpOutput = await imageFormat(manipResult.uri)
        if (webpOutput) {
            FileSystem.deleteAsync(localImage);
            localImage = webpOutput;
        }

        const result = await uploadFile(localImage);
        return result.key;
    }
    return null
}

let baseUrl: string | undefined;

const getFullUrl = (key: string) => {
    if (key.startsWith('http') || key.startsWith('data:') || key.startsWith('file://')) {

        return key
    }
    if (!baseUrl) {
        baseUrl = SystemService.GetStaticUrl()
    }
    const url = `${baseUrl}/${key}`
    console.log('[url]', url);

    return url;
}

// 判斷下載的文件是否存在
const checkDownloadFileExists = async (url: string) => {
    const key = crypto.Hash('sha256').update(url).digest('hex');
    const path = `${FileSystem.cacheDirectory}/${key}`;
    return await isExist(path);
}

const checkExist = async (path: string): Promise<boolean> => {
    return await isExist(path);
}

const urlToPath = (url: string) => {
    const key = crypto.Hash('sha256').update(url).digest('hex');
    return `${FileSystem.cacheDirectory}/${key}`;
}

const downloadFile = async (url: string, path: string = ''): Promise<string> => {
    if (!path) {
        const key = crypto.Hash('sha256').update(url).digest('hex');
        path = `${FileSystem.cacheDirectory}/${key}`;
    }
    // 判斷文件是否存在
    if (await isExist(path)) {
        return path;
    }
    const result = await FileSystem.downloadAsync(url, path, {
        md5: true,
    });

    if (result.status !== 200) {
        // 刪除文件
        await FileSystem.deleteAsync(path)
        throw new Error('下載失敗');
    }
    return path;
}

const readFile = async (path: string): Promise<string> => {
    return await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    });
}


const getFileNameSign = (key: string) => {
    return crypto.Hash('sha256').update(key).digest('hex');
}

// 保存到相冊
const saveToAlbum = async (uri: string, extType = ''): Promise<boolean> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
        return false;
    }
    try {
        if (uri.startsWith('data')) {
            // 獲取文件類型
            const mimeType = uri.split(';')[0].split(':')[1];
            // 獲取文件後綴
            // 生成文件名 保存在緩存目錄
            const data = uri.split(',')[1];
            uri = `${FileSystem.cacheDirectory}${crypto.randomUUID()}.${mime.getExtension(mimeType)}`;
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });
        }
        if (!uri.startsWith('file')) {
            return false
        }

        const ext = extType === '' ? mime.getExtension(mime.getType(uri) ?? '') : extType;
        if (ext == 'webp') {
            // const output = uri.replace(`.${ext}`, '.jpg');
            const output = await imageFormat(uri);
            uri = output;
        } else {
            if (uri.indexOf('.' + ext) === -1) {
                const localPath = uri + '.' + ext
                await FileSystem.copyAsync({
                    from: uri,
                    to: localPath
                })
                uri = localPath
            }
        }
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('BoboChat', asset, false)
        return true;
    } catch (error: any) {
    }
    return false
}
const saveFile = async (data: string, name: string): Promise<string | null> => {
    if (data.startsWith('data')) {
        data = data.split(',')[1];
    }
    if (Platform.OS === 'android') {
        // 保存到相冊
        const dir = await requestDirectoryPermission();
        if (!dir) {
            return null;
        }
        // 生成文件名 保存在緩存目錄
        let path = `${dir}/${name}`;
        // 判斷文件是否存在
        const exists = await RNFS.exists(path);
        if (exists) {
            // 在原來的文件名的基礎上加上時間戳
            const time = new Date().getTime();
            const ext = path.split('.').pop();
            name = name.replace(`.${ext}`, `_${time}.${ext}`);
            path = `${dir}/${name}`;
        }
        await RNFS.writeFile(path, data, {
            encoding: 'base64',
        });
        return path;
    } else {
        let path = `${FileSystem.cacheDirectory}${name}`;
        const exists = await FileSystem.getInfoAsync(path);
        if (exists.exists) {
            const time = new Date().getTime();
            const ext = path.split('.').pop();
            path = path.replace(`.${ext}`, `_${time}.${ext}`);
        }
        await FileSystem.writeAsStringAsync(path, data, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return path;
    }
}
const getFileInfo = async (path: string) => {
    return await FileSystem.getInfoAsync(path, {
        size: true,
        md5: true,
    });
}
export default {
    chooseImage,
    uploadFile,
    getFullUrl,
    downloadFile,
    readFile,
    saveToAlbum,
    saveFile,
    getFileInfo,
    checkDownloadFileExists,
    urlToPath,
    getFileNameSign,
    checkExist,
    uploadImage
}
