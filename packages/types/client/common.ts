export interface BaseResp<T> {
  code:number,
  msg: string,
  data: T
}

export interface BasePageReq {
  limit: number;
  page: number;
}

export interface BasePageResp<T>{
  page: number,
  limit: number,
  items: T[],
  status: number,
  total: number
}

export interface BaseArrayResp<T>{
  items: T[]
}

export interface BaseIdReq {
  id: string,
}

export interface BaseIdArrayReq {
  id: string[],
}

export interface BaseIdsArrayReq {
  ids: string[],
}

export interface BaseIdsNumberReq {
  ids: number[],
}


export interface BaseUIdArrayReq {
  uids: string[],
}
