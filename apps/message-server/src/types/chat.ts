import { IModel } from '@repo/enums'
import { MessageExtra } from './common'


export interface ChatDetailItem {
  id: string
  // creatorId: string
  type: IModel.IChat.IChatTypeEnum
  status: number
  isEnc: number
  lastReadSequence: number
  lastSequence: number
  firstSequence: number
  lastTime: number
  sourceId: bigint
  isTop: number
  createdAt?: number
  avatar?: string
  chatAlias?: string
  isMute: number
}

export interface ChatEntity {
  id: string
  businessId?: bigint | null
  businessType: number
  userIds?: string | null
  creatorUId: bigint
  status: number
  isEnc: number
  lastReadSequence: number
  lastSequence: number
  lastTime?: Date | null
  createdAt?: Date | string
  updatedAt?: Date | string
}


export interface MessageListItem {
  id: string
  msgId: string
  isRead: number
  sequence: number
  createdAt: Date
}

export interface MessageDetailItem {
  id: string
  chatId: string
  fromUid: bigint
  fromUidType: number
  content: string
  status: number
  type: number
  isEnc: number
  sequence: number
  extra: MessageExtra
  action: any
  createdAt: Date
}

export interface MessageDetailEntity {
  id: string
  chatId: string
  fromUid: bigint
  fromUidType: number
  content: string
  status?: number
  type: number
  isEnc?: number
  sequence: number
  receiveIds?: string | null
  extra?: string | null
  action?: string | null
  createdAt: Date
  updatedAt: Date
}


export interface ChatUserItem { chatId: string, userId: bigint }
