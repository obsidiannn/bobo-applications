import { protos } from '@repo/grpc/proto'
export interface RequestContext {
  address: string
  body: any
  userId: bigint
  user: protos.user.User
}


export interface MessageExtra {
  // 备注
  remark?: string
  // 红包id
  id?: string
  // 过期时间
  expireSecond?: number
}
