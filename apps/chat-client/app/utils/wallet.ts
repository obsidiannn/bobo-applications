
import { SignatureLike, ethers, hashMessage, verifyMessage } from "ethers";
import Crypto from "react-native-quick-crypto";

import { Wallet as EWallet } from "ethers";
ethers.randomBytes.register((length) => {
  return new Uint8Array(Crypto.randomBytes(length));
});

ethers.computeHmac.register((algo, key, data) => {
  return Crypto.createHmac(algo, key).update(data).digest();
});

ethers.pbkdf2.register((passwd, salt, iter, keylen, algo) => {
  const algos = algo == 'sha256' ? 'SHA-256' : 'SHA-512'
  const data =Crypto.pbkdf2Sync(passwd, salt, iter, keylen, algos)
  return new Uint8Array(data);
});

ethers.sha256.register((data) => {
  const datax = data.buffer.slice(data.byteOffset, data.byteLength + data.byteOffset) as ArrayBuffer
  return Crypto.createHash('sha256').update(datax).digest();
});

ethers.sha512.register((data) => {
  const datax = data.buffer.slice(data.byteOffset, data.byteLength + data.byteOffset) as ArrayBuffer
  return Crypto.createHash('sha512').update(datax).digest();
});

export interface IAppContext {
  language: string
}

export const generatePrivateKey = () => ethers.Wallet.createRandom().privateKey
export const computeDataHash = (data: string) => hashMessage(Crypto.createHash('sha256').update(data).digest('hex').substring(0, 16))
export class Wallet {
  private wallet: EWallet;
  private privateKey: string;
  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.wallet = new ethers.Wallet(privateKey)
  }
  static recoverAddress(data: ethers.BytesLike, sign: SignatureLike) {
    return verifyMessage(data, sign).toLowerCase();
  }

  priKey(){
    return this.privateKey;
  };
  signMessage(data: string) {
    return this.wallet.signMessageSync(data)
  }
  computeSharedSecret(pubKey: string): string {
    if (pubKey.slice(0, 2) !== '0x') {
      pubKey = '0x' + pubKey
    }
    return this.wallet.signingKey.computeSharedSecret(pubKey);
  }
  getPublicKey() {
    return this.wallet.signingKey.compressedPublicKey;
  }
  getAddress() {
    return this.wallet.address.toLowerCase();
  }
}