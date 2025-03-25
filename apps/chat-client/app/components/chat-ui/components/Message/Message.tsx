import { oneOf } from '@flyerhq/react-native-link-preview'
import * as React from 'react'
import { GestureResponderEvent, Pressable, Text, View } from 'react-native'

import { MessageType } from '../../types'
import {
  excludeDerivedMessageProps,
  formatDate,
  ThemeContext,
  UserContext,
} from '../../utils'
import { Avatar } from '../Avatar'
import { FileMessage } from '../FileMessage'
import { ImageMessage } from '../ImageMessage'
import { StatusIcon } from '../StatusIcon'
import { TextMessage, TextMessageTopLevelProps } from '../TextMessage'
import styles from './styles'
import { VideoMessage } from '../VideoMessage'
import { s } from 'app/utils/size'
import Checkbox from 'expo-checkbox'
import { colors } from 'app/theme'
import { FileMessageReply } from '../FileMessage/FileMessageReply'
import { VideoMessageReply } from '../VideoMessage/VideoMessageReply'
import { ImageMessageReply } from '../ImageMessage/ImageMessageReply'
import { TextMessageReply } from '../TextMessage/TextMessageReply'
import { UserCardMessage } from '../UserCard/UserCard'
import { UserCardReply } from '../UserCard/UserCardReply'

export interface MessageTopLevelProps extends TextMessageTopLevelProps {
  /** Called when user makes a long press on any message */
  onMessageLongPress?: (message: MessageType.Any, e: GestureResponderEvent) => void
  /** Called when user taps on any message */
  onMessagePress?: (message: MessageType.Any) => void
  /** Customize the default bubble using this function. `child` is a content
   * you should render inside your bubble, `message` is a current message
   * (contains `author` inside) and `nextMessageInGroup` allows you to see
   * if the message is a part of a group (messages are grouped when written
   * in quick succession by the same author) */
  renderBubble?: (payload: {
    child: React.ReactNode
    message: MessageType.Any
    nextMessageInGroup: boolean
  }) => React.ReactNode
  /** Render a custom message inside predefined bubble */
  renderCustomMessage?: (
    message: MessageType.Custom,
    messageWidth: number
  ) => React.ReactNode
  /** Render a file message inside predefined bubble */
  renderFileMessage?: (
    message: MessageType.File,
    messageWidth: number
  ) => React.ReactNode
  /** Render an image message inside predefined bubble */
  renderImageMessage?: (
    message: MessageType.Image,
    messageWidth: number
  ) => React.ReactNode
  /** Render a text message inside predefined bubble */
  renderTextMessage?: (
    message: MessageType.Text,
    messageWidth: number,
    showName: boolean
  ) => React.ReactNode
  /** Show user avatars for received messages. Useful for a group chat. */
  showUserAvatars?: boolean
  // 多选状态
  enableMultiSelect?: boolean
}

export interface MessageProps extends MessageTopLevelProps {
  enableAnimation?: boolean
  message: MessageType.DerivedAny
  messageWidth: number
  roundBorder: boolean
  showAvatar: boolean
  showName: boolean
  showStatus: boolean
  enableMultiSelect: boolean
  checked: () => boolean
  onChecked?: (id: string, checked: boolean) => void
}

/** Base component for all message types in the chat. Renders bubbles around
 * messages and status. Sets maximum width for a message for
 * a nice look on larger screens. */
export const Message = React.memo(
  ({
    enableAnimation,
    message,
    messageWidth,
    onMessagePress,
    onMessageLongPress,
    onPreviewDataFetched,
    renderBubble,
    renderCustomMessage,
    renderFileMessage,
    renderImageMessage,
    renderTextMessage,
    roundBorder,
    showAvatar,
    showName,
    showStatus,
    showUserAvatars,
    usePreviewData,
    enableMultiSelect,
    checked,
    onChecked
  }: MessageProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const currentUserIsAuthor =
      message.type !== 'dateHeader' && user?.id === message.author.id
    const checkVal = checked()
    const { container, contentContainer, dateHeader, pressable, messageBody, messageHeader } = styles({
      currentUserIsAuthor,
      message,
      messageWidth,
      roundBorder,
      theme,
      enableMultiSelect,
      checked: checkVal
    })
    // 日期拆分不用了
    // if (message.type === 'dateHeader') {
    //   return (
    //     <View style={dateHeader}>
    //       <Text style={theme.fonts.dateDividerTextStyle}>{message.text}</Text>
    //     </View>
    //   )
    // }
    if (message.type === 'dateHeader') {
      return null
    }
    message = message as MessageType.DerivedMessage
    const renderBubbleContainer = () => {
      const child = renderMessage()

      return oneOf(
        renderBubble,
        <View style={contentContainer} testID='ContentContainer' pointerEvents="none">
          {child}
        </View>
      )({
        child,
        message: excludeDerivedMessageProps(message),
        nextMessageInGroup: roundBorder,
      })
    }

    const renderMessage = () => {
      switch (message.type) {
        case 'custom':
          return (
            renderCustomMessage?.(
              // It's okay to cast here since we checked message type above
              // type-coverage:ignore-next-line
              excludeDerivedMessageProps(message) as MessageType.Custom,
              messageWidth
            ) ?? null
          )
        case 'file':
          return oneOf(renderFileMessage, <FileMessage {...{
            messageWidth,
            message

          }} />)(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.File,
            messageWidth
          )
        case 'video':
          return oneOf(
            renderImageMessage,
            <VideoMessage
              {...{
                message,
                messageWidth,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Image,
            messageWidth
          )
        case 'image':
          return oneOf(
            renderImageMessage,
            <ImageMessage
              {...{
                message,
                messageWidth,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Image,
            messageWidth
          )
        case 'text':
          return oneOf(
            renderTextMessage,
            <TextMessage
              {...{
                enableAnimation,
                message,
                messageWidth,
                onPreviewDataFetched,
                showName,
                usePreviewData,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Text,
            messageWidth,
            showName
          )
        case 'userCard':
          return <UserCardMessage message={message} />
        default:
          return null
      }
    }


    const renderReply = () => {
      if (!message.reply) {
        return null
      }
      switch (message.reply.type) {
        case 'file':
          return <FileMessageReply {...{
            message: message.reply
          }} />
        case 'video':
          return <VideoMessageReply {...{ message: message.reply, messageWidth: 100 }} />
        case 'image':
          return <ImageMessageReply
            {...{
              message: message.reply
            }}
          />
        case 'text':
          return <TextMessageReply message={message.reply} />
        case 'userCard':
          return <UserCardReply message={message.reply} />
        default:
          return null
      }
    }


    return (
      <View style={container}>
        {enableMultiSelect ? <Checkbox
          value={checkVal}
          color={colors.palette.primary}
          style={{
            alignSelf: 'flex-start',
            marginLeft: s(12),
            marginTop: s(4),
            borderRadius: s(24),
          }}
          onValueChange={(v) => {
            onChecked && onChecked(message.id, v)
          }}
        /> : null}
        {
          currentUserIsAuthor ?
            <View style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
              <View style={messageBody}>
                <View style={messageHeader}>
                  <Text style={[theme.fonts.dateDividerTextStyle, { marginRight: 8 }]}>{formatDate(message.createdAt ?? 0)}</Text>
                  <Text style={theme.fonts.userNameTextStyle}>{message.author.firstName}</Text>
                </View>
                <View>
                  <Pressable
                    onStartShouldSetResponderCapture={(ev) => { return true }}
                    onLongPress={(e) => {
                      onMessageLongPress?.(excludeDerivedMessageProps(message), e)
                    }}
                    onPress={() => {
                      if (enableMultiSelect) {
                        onChecked && onChecked(message.id, !checked())
                      } else {
                        onMessagePress?.(excludeDerivedMessageProps(message))
                      }
                    }}
                    style={pressable}
                  >
                    {renderBubbleContainer()}
                  </Pressable>
                  {message?.reply ? <View style={{
                    backgroundColor: colors.palette.gray100,
                    alignItems: 'flex-start',
                    alignSelf: 'flex-end',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    padding: s(8),
                    borderRadius: s(12),
                    marginTop: s(4)
                  }}>
                    <Text>{message?.metadata?.replyAuthorName ?? ""} : </Text>
                    {renderReply()}
                  </View> : null}
                </View>
              </View>
              <View style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}>
                {/* 'delivered' | 'error' | 'seen' | 'sending' | 'sent' */}
                <Avatar
                  {...{
                    author: message.author,
                    currentUserIsAuthor,
                    showAvatar,
                    showUserAvatars,
                    theme,
                  }}
                />
                <View style={{
                  marginLeft: s(8),
                }}>
                  <StatusIcon
                    {...{
                      currentUserIsAuthor,
                      showStatus: true,
                      status: message.status,
                      theme,
                    }}
                  />
                </View>
              </View>
            </View>
            :
            (
              <View style={{
                display: 'flex',
                flexDirection: 'row',
              }}>

                <Avatar
                  {...{
                    author: message.author,
                    currentUserIsAuthor,
                    showAvatar,
                    showUserAvatars,
                    theme,
                  }}
                />
                <View style={messageBody}>
                  <View style={messageHeader}>
                    <Text style={[theme.fonts.dateDividerTextStyle, { marginRight: 8 }]}>{formatDate(message.createdAt ?? 0)}</Text>
                    <Text style={theme.fonts.userNameTextStyle}>{message.author.firstName}</Text>
                  </View>
                  <Pressable
                    onStartShouldSetResponderCapture={(ev) => { return true }}
                    onLongPress={(e) => {
                      onMessageLongPress?.(excludeDerivedMessageProps(message), e)
                    }}
                    onPress={() => onMessagePress?.(excludeDerivedMessageProps(message))}
                    style={pressable}
                  >
                    {renderBubbleContainer()}
                  </Pressable>
                  {message?.reply ? <View style={{
                    backgroundColor: colors.palette.gray100,
                    alignItems: 'flex-start',
                    alignSelf: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    padding: s(8),
                    borderRadius: s(12),
                    marginTop: s(4)
                  }}>
                     <Text>{message?.metadata?.replyAuthorName ?? ""} : </Text>
                    {renderReply()}
                  </View> : null}
                </View>
              </View>
            )
        }

      </View>
    )
  }
)
