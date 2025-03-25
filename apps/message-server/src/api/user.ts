import { user } from '@repo/grpc/client'
import { protos } from '@repo/grpc/proto'

let client: user.UserProtoClient | null = null

const getClient = (): user.UserProtoClient => {
  if (client === null) {
    client = new user.UserProtoClient(process.env.USER_GRPC_ADDR);
  }
  return client
}

/**
 * 根据 address 获取userId
 */
const queryUserIdFromAddress = async (address: string): Promise<protos.user.User | null> => {
  const response = await getClient().findUsersByAddrs([address])
  console.log('address', response);
  if (response && response.length > 0) {
    if (response[0]) {
      const item: protos.user.User = response[0]
      return item
    }
  }
  return null;
}


const checkUserByIds = async (ids: bigint[]): Promise<{ items: bigint[] }> => {
  const response = await getClient().findUsersByIds(ids)
  return { items: response.map(u => BigInt(u.id)) }
}


export default {
  queryUserIdFromAddress,
  checkUserByIds
}
