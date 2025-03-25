
export interface SystemPubKeyResp {
	pubKey: string;
	staticUrl: string;
};

export interface SystemPreSignUrlUploadReq {
	url: string;
}

export interface SysCategoryReq {
	type: number
}

export interface SysCategoryItem {
	id: number
	name: string
	describe: string
	sort: number
	type: number
	config?: SysCategoryConfig
}

export interface SysCategoryConfig {
	color?: string
}