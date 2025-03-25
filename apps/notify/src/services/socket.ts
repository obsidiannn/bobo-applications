import { io, sessionMap } from '../index'
import { recoverAddress } from '@/lib/util'
import { hashMessage } from 'ethers'
import { RedisWrapper, initClient, redisClient, subscribeClient } from './redis'
import JsonBigInt from 'json-bigint'
import redisAdapter from 'socket.io-redis'
import { protos } from '@repo/grpc/proto'
import { UserOnlineService } from './user-online.service'
import { SenderService } from './sender.service'
import { FirebaseService } from './firebase.service'
import { pushMessage } from '@/grpc/notify.grpc'


const pub = initClient()
const sub = pub.duplicate()
/**
 * 服务端主动发送消息给client
 */
const sendMessage = (uid: string, data: protos.notify.SocketEventRequest): boolean => {
  console.log('[socket] send begin ', uid, data)
  const client = io.sockets.sockets.get(uid)
  if (client !== undefined && client !== null) {
    return client.emit('message', data)
  }
  return false
}

const sendRoom = (chatId: string, data: string): boolean => {
  const roomKey = getRoomKey(chatId)
  console.log('发送room消息', roomKey, data)
  return io.to(roomKey).emit('message', data)
}

const sendRoomKey = (eventKey: string, chatId: string, data: string): boolean => {
  const roomKey = getRoomKey(chatId)
  console.log('发送room消息', roomKey, data)
  return io.to(roomKey).emit(eventKey, data)
}

const sendUser = (userId: string, data: string): boolean => {
  const userSessionId = sessionMap.get(userId)
  if (userSessionId) {
    console.log('发送个人消息', userId, data)
    return io.to(userSessionId).emit('message', data)
  }
  return false
}
const getRoomKey = (chatId: string): string => {
  return 'BOBO_SOCKET_ROME:' + chatId
}

const init = (): void => {
  io.adapter(redisAdapter.createAdapter(
    {
      pubClient: pub,
      subClient: sub
    }))
  io.on('connection', async (socket) => {
    const vals = checkConnection(socket.handshake.headers)
    if (!vals || vals === null) {
      console.log('鉴权失败', socket.id)
      socket.disconnect()
      return
    }
    const id = vals[0]
    if (!id) {
      return
    }
    socket.data.seq = vals[1]
    console.log("vals", vals);
    console.log('[connect]id', socket.id, id)
    sessionMap.set(id, socket.id)
    try {
      const userId = BigInt(vals[1] ?? '0')
      await redisClient.setBit(vals[1] ?? '', 1)
      if (userId) {
        await UserOnlineService.online(userId)
      }

    } catch (e) { }
    socket.on('disconnect', async () => {
      const userId = BigInt(vals[1] ?? '0')
      if (userId) {
        await UserOnlineService.offline(userId)
      }
      console.log(`disconnect ${socket.id}`)
      await redisClient.setBit(vals[1] ?? '', 0)
    })
    socket.on('join', async (r) => {
      console.log('收到join', r, vals[1])
      console.log('rooms:', socket.rooms)

      const roomKey = getRoomKey(r)
      if (!socket.rooms.has(roomKey)) {
        console.log('join', roomKey)
        void socket.join(roomKey)
      }
    })
    socket.on('typing', async (e) => {
      console.log('收到typing', e)
      const item = JSON.parse(e)
      if (item.chatId) {
        sendRoomKey('typing', item.chatId, e)
      }
    })
  })

  subscribeClient.getClient().on('connect', () => {
    redisInit(subscribeClient)
  })
}

const redisInit = (r: RedisWrapper): void => {
  consumeMessage(r)
}

/**
 * 消费并发送消息
 * @param r 
 */
const consumeMessage = (r: RedisWrapper) => {
  r.getClient()
    .brpop('SOCKET_MESSAGE_QUEUE_TOPIC', 0, (err, message) => {
      if (err !== null) {
        console.log('[redis]订阅失败', err)
        return
      }
      if (!message) {
        return
      }
      console.log('收到消息', message)
      const event = JsonBigInt.parse(message[1]) as protos.notify.SocketEventRequest
      switch (event.type) {
        case protos.notify.SocketEventTypeEnum.CHAT:
          sendRoom(event.channel, message[1])
          if (event.recieverIds && event.recieverIds.length > 0) {
            SenderService.getInstance()
              .onlineCheck(event.recieverIds.map(id => Number(id)))
              .then((offlineIds) => {
                if (offlineIds.length > 0) {
                  console.log('offlineIds', offlineIds)
                  const msg = FirebaseService.initMessage(event, event.type)
                  const req: protos.notify.PushRequest = {
                    userIds: offlineIds.map(BigInt),
                    topics: [],
                    title: msg.notification?.title ?? '',
                    body: JsonBigInt.stringify(msg.notification?.body) ?? '',
                    data: JsonBigInt.stringify(msg.data) ?? ''
                  }
                  FirebaseService.push(req).then(() => { }).catch(() => { })
                }
              })
              .catch((e) => {
                console.error(e)
              })
          }

          break
        case protos.notify.SocketEventTypeEnum.SYSTEM:
          if (event.recieverIds && event.recieverIds.length > 0) {

            for (let index = 0; index < event.recieverIds.length; index++) {
              const id = event.recieverIds[index];
              sendUser(String(id), message[1])
            }
          }
          break
        default: break;
      }
      consumeMessage(r)
    })
    .catch((e) => {
      console.log(e)
    })
}

// io.engine.generateId = (req): string => {
//   console.log('[req]', req.headers)
//   const id = checkConnection(req.headers)
//   if (id === null) {
//     return randomUUID().toString()
//   } else {
//     console.log('[id]', id)
//     return id
//   }
// }

// 鉴权
const checkConnection = (headers: any): string[] | null => {

  const sign = (headers['x-sign'] ?? '') as string
  console.log('[sign]', sign)

  const time = (headers['x-time'] ?? '') as string
  if (sign === '' || time === '') {
    return null
  }
  const dataHash = (headers['x-data-hash'] ?? '') as string
  if (dataHash === '') {
    return null
  }
  const uid = recoverAddress(hashMessage(dataHash + ':' + time), sign)
  return [uid, headers['x-sequence']]
}

const sendBatchMessage = (uids: string[], data: protos.notify.SocketEventRequest): string[] => {
  const failedIds: string[] = []
  uids.forEach((u) => {
    const sid = sessionMap.get(u)
    if (sid !== undefined && sid !== null) {
      const result = sendMessage(sid, data)
      if (!result) {
        failedIds.push(u)
      }
    } else {
      failedIds.push(u)
    }
  })
  return failedIds
}

export default {
  init,
  sendMessage,
  sendBatchMessage,
}
