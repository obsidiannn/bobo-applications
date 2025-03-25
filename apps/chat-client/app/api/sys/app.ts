import { createInstance } from '../req';
import { IServer, SysCategoryItem } from "@repo/types";
export interface IGetVersionsParams {
    platform: string;
    language: string;
    offset: number;
    limit: number;
}
const getVersions = async (params: IGetVersionsParams): Promise<{
    list: IServer.IAppVersion[]
}> => await createInstance(true).post('/sys/app/versions', params);

const getCategories = async (params: {
    type: number
}): Promise<{
    list: SysCategoryItem[]
}> => await createInstance(true).post('/sys/app/categories', params);


export default {
    getVersions,
    getCategories
}