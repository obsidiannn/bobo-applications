import { Linking } from "react-native";


const scanQrcode = async (val: string) => {
    if(await Linking.canOpenURL(val)){
        console.log('open');
        
        Linking.openURL(val)
    }
}

export default {
    scanQrcode
}