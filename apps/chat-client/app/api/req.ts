import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import quickCrypto from "app/utils/quick-crypto";
import { InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { Wallet, computeDataHash } from 'app/utils/wallet';
import toast from 'app/utils/toast';
import { AuthService } from 'app/services/auth.service';
import { SystemService } from 'app/services/system.service';
import {SYSTEM_PUBLIC_KEY} from "@env"
const encodeInterceptor = async (wallet: Wallet, config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig<any>> => {
  const content = typeof config.data === 'string' ? config.data : JSON.stringify(config.data ?? {})

  const time = Date.now();
  const sharedSecret = wallet.computeSharedSecret(SYSTEM_PUBLIC_KEY)

  const dataHash = computeDataHash(content + ':' + time);
  const sign = wallet.signMessage(dataHash)
  config.headers.set('X-Req-Sign', sign);
  config.headers.set('X-Req-Data-Hash', dataHash);
  config.headers.set('X-Req-Time', time);
  config.headers.set('X-Req-OS', Platform.OS);
  config.headers.set('X-Req-Pub-Key', wallet.getPublicKey());

  const data = quickCrypto.En(sharedSecret, Buffer.from(content, "utf8"))
  config.data = Buffer.from(data).toString("hex");
  return config;
}
const decodeInterceptor = async (wallet: Wallet, rep: AxiosResponse<any, any>): Promise<AxiosResponse<any, any>> => {
  let data = rep.data ?? ""

  if (data.substring(0, 2) == '0x') {
    data = data.substring(2)
  }
  const sharedSecret = wallet.computeSharedSecret(SYSTEM_PUBLIC_KEY)
  let rel: any = {}
  if (data != "") {
    const decrypted = quickCrypto.De(sharedSecret, Buffer.from(data, 'hex'))
    const text = Buffer.from(decrypted).toString('utf8');
    rel = JSON.parse(text ?? '{}');
  }
  if (rel?.code && Number(rel?.code) != 200) {
    toast(rel.msg);
    throw new Error(rel.err_msg);
  }
  
  return rel.data;
}

export const createInstance = (en = true) => {
  //const baseURL = "http://192.168.0.102:5001"
  const baseURL = SystemService.GetApiUrlByCache();
  const instance: AxiosInstance = axios.create({
    baseURL,
    withCredentials: false,
    timeout: 3000,
  });
  instance.interceptors.request.use(async (config) => {
    const wallet = AuthService.GetWallet();
    if (!wallet) {
      throw new Error('請先登錄');
    }
    return await encodeInterceptor(wallet, config);
  }, (err) => {
    throw new Error(err.message);
  })
  instance.interceptors.response.use(async (rep) => {
    const wallet = AuthService.GetWallet();
    if (!wallet) {
      throw new Error('請先登錄');
    }

    return await decodeInterceptor(wallet, rep);
  }, (err) => {
    if (axios.isAxiosError(err)) {
      console.log('axios error: ',err);
      
      if (!err.response) {
        // toast('網絡錯誤,請稍後重試!');
      } else {
        const wallet = AuthService.GetWallet();
        const sharedSecret = wallet.computeSharedSecret(SYSTEM_PUBLIC_KEY)
        const decrypted = quickCrypto.De(sharedSecret, Buffer.from(err.response?.data, 'hex'))
        const text = Buffer.from(decrypted).toString('utf8');
        const rel: any = JSON.parse(text ?? '{}');
        toast(rel.message ?? '未知的錯誤');
      }
    }
    throw new Error(err.message);
  });
  return instance;
};
