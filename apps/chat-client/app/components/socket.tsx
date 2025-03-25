import socketClient, { Socket } from 'socket.io-client'
import React, { createContext, useEffect, useRef, useState } from 'react';
import { AppStateStatus, Platform } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import EventManager from 'app/services/event-manager.service'

import { AuthUser, ChatsStore } from 'app/stores/auth';
import { ChatDetailItem, ChatTypingEvent, SocketJoinEvent, SocketMessageEvent } from '@repo/types';
import { IModel } from '@repo/enums';
import { IUser } from 'drizzle/schema';
import { computeDataHash } from 'app/utils/wallet';
import { globalKV } from 'app/utils/kv-tool';
import { SystemService } from 'app/services/system.service';
import eventUtil from 'app/utils/event-util';

export interface SocketContextType {
    socket: Socket
    initRoom: (items: ChatDetailItem[]) => void
    init: (user?: IUser) => void;
    close: () => void;
    setAppState: (state: AppStateStatus) => void;
}

export const SocketContext = createContext({} as SocketContextType)

const connectionConfig = {
    timeout: 10000,
    pingTimeout: 30000,
    jsonp: false,
    reconnection: false,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10000,
    transport: ['websocket'],
    query: {
        platform: Platform.OS
    }
}

export const SocketProvider = ({ children }: { children: any }) => {
    const socketRef = useRef<Socket>()
    const currentUser = useRecoilValue(AuthUser)
    const connectedRef = useRef<boolean>(false)
    const appStateRef = useRef<AppStateStatus>("active")
    const setChatsStore = useSetRecoilState(ChatsStore)
    const joinedRef = useRef<Set<string>>(new Set())
    useEffect(() => {
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.SOCKET_JOIN, '')
        EventManager.addEventSingleListener(_eventKey, handleJoin)
        const typingEventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.TYPING_CHANGE, '')
        EventManager.addEventSingleListener(typingEventKey, handleTyping)
    }, [])
    // 输入中事件上报
    const handleTyping = (e: ChatTypingEvent) => {
        if (socketRef.current && socketRef.current?.active === true) {
            console.log('[typing] submit:', e);
            socketRef.current.emit('typing', JSON.stringify(e))
        }
    }

    const handleJoin = (e: any) => {
        console.log('socket join event', e);
        console.log('socket join', joinedRef.current);
        const _event = e as SocketJoinEvent
        if (!socketRef.current) {
            return
        }
        if (_event.chatIds && _event.chatIds.length > 0) {
            const chatIds = _event.chatIds.filter(c => {
                return !joinedRef.current.has(c)
            })
            const result = initRoom(chatIds)
            console.log('join', result);
            if (result.length > 0) {
                result.forEach(r => {
                    joinedRef.current.add(r)
                })
            }
        }

    }
    const setAppState = (state: AppStateStatus) => appStateRef.current = state

    const reJoin = () => {
        const chatIdstr = globalKV.get('string', 'chats_idx') as string
        if (chatIdstr && chatIdstr !== '') {
            console.log('rejoin', chatIdstr);
            const result = initRoom(chatIdstr.split(','))
            if (result.length > 0) {
                result.forEach(r => {
                    joinedRef.current.add(r)
                })
            }
        }
    }

    const loadSocketConfig = (user: IUser) => {
        if (!global.wallet) {
            return null
        }
        const content = JSON.stringify({ id: user?.id })
        // const time = String(Math.floor(new Date().getTime() / 1000))
        // const sharedSecret = wallet.signingKey.computeSharedSecret(Buffer.from(sysPubKey, 'hex'))
        // const dataHash = quickCrypto.En(content, Buffer.from(process.env.EXPO_PUBLIC_SYSTEM_PUBLIC_KEY, 'utf8'))
        const time = Date.now();
        const dataHash = computeDataHash(content + ':' + time);
        const sign = global.wallet.signMessage(dataHash + ':' + time)
        const config = {
            ...connectionConfig,
            extraHeaders: {
                'X-Sequence': user?.id.toString(),
                'X-Pub-Key': global.wallet.getPublicKey(),
                'X-Sign': sign,
                'X-Time': time,
                'X-Data-Hash': '0x' + Buffer.from(dataHash).toString('hex')
            }
        }
        return config
    }

    const init = (user?: IUser) => {
        console.log('初始化[socket] init,ref===null?', (socketRef.current === null || socketRef.current === undefined));
        console.log('[socket] user=', user);
        console.log('[socket] current=', currentUser);
        const env = SystemService.GetSocketUrl()
        const config = loadSocketConfig(user ?? currentUser)
        console.log('config=', config);

        if (config === null) {
            return
        }
        let newClient = false
        if (socketRef.current === null || socketRef.current === undefined) {
            socketRef.current = socketClient(env, { ...config, path: '/ws' })
            newClient = true
        } else {
            console.log('[socket active]', socketRef.current?.active);
            if (!socketRef.current?.active) {
                socketRef.current?.connect()
            }
        }
        console.log('[socket] init:', env, config);
        initListener()
    }
    const close = () => {
        console.log('主动[socket] close');
        socketRef.current?.close()
        joinedRef.current.clear()
    }
    const initListener = () => {
        if (!socketRef.current) {
            console.log('init listener error');

            return
        }
        if (!socketRef.current.hasListeners('connect')) {
            console.log('init listener [connected]');
            socketRef.current.on('connect', () => {
                connectedRef.current = true;
                console.log('[socket] conencted');
                reJoin()
            })
        }
        if (!socketRef.current.hasListeners('message')) {
            console.log('init listener [message]');
            socketRef.current.on('message', (msg) => {
                const _msg = JSON.parse(msg) as SocketMessageEvent
                console.log('[socket] receive', _msg)
                const eventKey = EventManager.generateKey(_msg.type, _msg.channel)
                try {
                    EventManager.emit(eventKey, _msg)
                } catch (e) {
                    console.log(e);
                }
                setChatsStore((items) => {
                    const newItems = items.map(t => {
                        if (_msg.channel === t.id) {
                            return { ...t, lastSequence: _msg.sequence }
                        }
                        return t
                    })
                    return newItems
                })
            })
        }
        if (!socketRef.current.hasListeners('disconnect')) {
            console.log('init listener [disconnect]');
            socketRef.current.on('disconnect', msg => {
                console.log('[socket] disconnect');
                connectedRef.current = false;
                joinedRef.current?.clear()
                socketRef.current?.removeAllListeners()
                if (appStateRef.current == "active") {
                    setTimeout(() => {
                        init()
                    }, 3000);
                }
            })
        }

        if (!socketRef.current.hasListeners('typing')) {
            console.log('init listener [typing]');
            socketRef.current.on('typing', (msg) => {
                const _msg = JSON.parse(msg) as ChatTypingEvent
                console.log('[socket] typing', _msg)
                eventUtil.sendRecieveTypeingEvent(_msg)
            })
        }

        socketRef.current.connect()
    }

    const initRoom = (chatIds: string[]): string[] => {
        const result: string[] = []
        if (chatIds.length > 0 && socketRef.current) {
            chatIds.forEach(c => {
                if (socketRef.current && socketRef.current?.active === true) {
                    socketRef.current.emit('join', c)
                    console.log('加入room', c, socketRef.current !== null);
                }
                result.push(c)
            })
        }
        return result
    }

    return <SocketContext.Provider value={{ socket: socketRef.current, init, setAppState, close }} >
        {children}
    </SocketContext.Provider>
}
