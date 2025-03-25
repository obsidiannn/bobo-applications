import * as Crypto from 'node:crypto'
const getIV = (val: string): string => {
    return Crypto.createHash('sha256')
        .update(val)
        .digest('hex')
        .substring(0, 16)
}
export const encrypted = (val: string, key: string): string => {
    const iv = getIV(key)
    const cipher = Crypto.createCipheriv('aes-128-cbc', iv, iv)
    const encryptedData = cipher.update(val, 'utf8', 'hex')
    return encryptedData + cipher.final('hex')
}
export const decrypted = (val: string, key: string): string => {
    const iv = getIV(key)
    const decipher = Crypto.createDecipheriv('aes-128-cbc', iv, iv)
    return decipher.update(val, 'hex', 'utf8') + decipher.final('utf8')
}