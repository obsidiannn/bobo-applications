
import { Wallet as EWallet, ethers, hashMessage,verifyMessage } from 'ethers'
import * as Crypto from 'crypto';
import { SignatureLike } from 'ethers';
import { BytesLike } from 'ethers';
export const generatePrivateKey = () =>{
    return ethers.Wallet.createRandom().privateKey
}
export const recoverAddress = (data: ethers.BytesLike, sign: SignatureLike) => {
    return verifyMessage(data,sign).toLowerCase();
}
export const generateDataHash = (data: Crypto.BinaryLike) => {
    return hashMessage(Crypto.createHash('sha256').update(data).digest('hex').substring(0, 16));
}
export class Wallet {
  private wallet: EWallet;
  constructor(privateKey: string) {
    this.wallet = new EWallet(privateKey)
  }
  signMessage(data: string) {
    return this.wallet.signMessageSync(data)
  }
  computeSharedSecret(pubKey: string): string {
    if (!pubKey.startsWith('0x')) {
      pubKey = '0x' + pubKey;
    };
    return this.wallet.signingKey.computeSharedSecret(pubKey);
  }
  getPublicKey() {
    return this.wallet.signingKey.compressedPublicKey;
  }
  getAddress() {
    return this.wallet.address.toLowerCase();
  }
}