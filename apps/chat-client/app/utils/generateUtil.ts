import crypto from "react-native-quick-crypto";
// mongo id 生成，需要12位的隨機數
import { Buffer } from "@craftzdog/react-native-buffer";

const generateId = (): string => {
    return Buffer.from(crypto.randomBytes(12)).toString('hex')
}

export default {
    generateId
}