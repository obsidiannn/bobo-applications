import { createInstance } from '../req';

export interface IUpgradeInfo{
    versionCode: number;
    versionName: string;
    description: string[];
    downloadUrl: string;
    forceUpdate: boolean;  
}
export interface IUpgradeResponse {
    android: IUpgradeInfo;
    ios: IUpgradeInfo;
}
const getUpgrade = async (): Promise<IUpgradeResponse> => await createInstance(true).post('/system/getUpgrade');

export default {
    getUpgrade,
}