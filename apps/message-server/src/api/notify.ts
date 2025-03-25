import { notify } from '@repo/grpc/client'

let client: notify.NotifyProtoClient | null = null

export const getNotifyClient = (): notify.NotifyProtoClient => {
  if (client === null) {
    client = new notify.NotifyProtoClient(process.env.NOTIFY_GRPC_ADDR);
  }
  return client
}
