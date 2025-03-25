import { s } from 'app/utils/size';
import { CameraView } from 'expo-camera';
import { BarCodeScanningResult } from 'expo-camera/build/legacy/Camera.types';
import { Image } from 'expo-image';
import { View } from "react-native";
export interface CameraWindowProps {
    onChange: (val: string) => void;
}
export const CameraWindow = (props: CameraWindowProps) => {
    return <View style={{
        flex: 1,
        borderTopRightRadius: s(32),
        borderTopLeftRadius: s(32),
        overflow:"hidden",
    }}>
        <CameraView style={{
        flex: 1,
    }} onBarcodeScanned={(scanningResult: BarCodeScanningResult) => props.onChange(scanningResult.data)} barcodeScannerSettings={{
        barcodeTypes: ["qr"]
    }}>
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View style={{
                flex: 1,
                width: s(375),
                backgroundColor: '#00000090'
            }}></View>
            <View style={{
                width: s(375),
                flexDirection: 'row',
                height: s(236),
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <View style={{
                    flex: 1,
                    width: s(16),
                    height: s(236),
                    backgroundColor: '#00000090'
                }}></View>
                <Image style={{
                    width: s(235),
                    height: s(235),
                    borderColor: '#00000090',
                    borderWidth: 1,
                }} source={require('./scan-window.png')} />
                <View style={{
                    flex: 1,
                    width: s(16),
                    height: s(236),
                    backgroundColor: '#00000090'
                }}></View>
            </View>
            <View style={{
                flex: 1,
                width: s(375),
                backgroundColor: '#00000090'
            }}></View>
        </View>
    </CameraView>
    </View>
}