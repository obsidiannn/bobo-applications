import * as React from 'react'
import { TextInput, TextInputProps, View, TouchableOpacity, Text } from 'react-native'

import { MessageType } from '../../types'
import { ThemeContext, translate, unwrap, UserContext } from '../../utils'
import {
  AttachmentButton,
  AttachmentButtonAdditionalProps,
} from '../AttachmentButton'
import {
  CircularActivityIndicator,
  CircularActivityIndicatorProps,
} from '../CircularActivityIndicator'
import { SendButton } from '../SendButton'
import styles from './styles'
import { IconFont } from 'app/components/IconFont/IconFont'
import { s } from 'app/utils/size'
import { FileMessageReply } from '../FileMessage/FileMessageReply'
import { colors } from 'app/theme'
import { ImageMessageReply } from '../ImageMessage/ImageMessageReply'
import { TextMessageReply } from '../TextMessage/TextMessageReply'
import { VideoMessageReply } from '../VideoMessage/VideoMessageReply'
import { UserCardReply } from '../UserCard/UserCardReply'

export interface InputTopLevelProps {
  /** Whether attachment is uploading. Will replace attachment button with a
   * {@link CircularActivityIndicator}. Since we don't have libraries for
   * managing media in dependencies we have no way of knowing if
   * something is uploading so you need to set this manually. */
  isAttachmentUploading?: boolean
  /** @see {@link AttachmentButtonProps.onPress} */
  onAttachmentPress?: (key: string) => void
  /** Will be called on {@link SendButton} tap. Has {@link MessageType.PartialText} which can
   * be transformed to {@link MessageType.Text} and added to the messages list. */
  onSendPress: (message: MessageType.PartialText) => void
  // 输入的值
  onTypingChange?: (val: boolean) => void
  /** Controls the visibility behavior of the {@link SendButton} based on the
   * `TextInput` state. Defaults to `editing`. */
  sendButtonVisibilityMode?: 'always' | 'editing'
  textInputProps?: TextInputProps
  // 启用多选
  enableMultiSelect?: boolean
  replyDerived: MessageType.DerivedAny | null
  // 关闭引用
  onCloseReply?: (id: string) => void
  onCollectPress: () => void
}

export interface InputAdditionalProps {
  attachmentButtonProps?: AttachmentButtonAdditionalProps
  attachmentCircularActivityIndicatorProps?: CircularActivityIndicatorProps
}

export type InputProps = InputTopLevelProps & InputAdditionalProps

/** Bottom bar input component with a text input, attachment and
 * send buttons inside. By default hides send button when text input is empty. */
export const Input = ({
  attachmentButtonProps,
  attachmentCircularActivityIndicatorProps,
  isAttachmentUploading,
  onAttachmentPress,
  onSendPress,
  sendButtonVisibilityMode,
  textInputProps,
  onTypingChange,
  enableMultiSelect,
  replyDerived,
  onCloseReply,
  onCollectPress
}: InputProps) => {
  const theme = React.useContext(ThemeContext)
  const user = React.useContext(UserContext)
  const { container, multiContainer, input, marginRight } = styles({ theme })
  const [typing, setTyping] = React.useState<boolean>(false)
  const typingRef = React.useRef(typing)
  // Use `defaultValue` if provided
  const [text, setText] = React.useState(textInputProps?.defaultValue ?? '')

  const value = textInputProps?.value ?? text


  const handleSend = () => {
    const trimmedValue = value.trim()

    // Impossible to test since button is not visible when value is empty.
    // Additional check for the keyboard input.
    /* istanbul ignore next */
    if (trimmedValue) {
      onSendPress({ text: trimmedValue, type: 'text' })
      handleTyping(false)
      setText('')
    }
  }

  const handleTyping = (flag: boolean) => {

    onTypingChange && onTypingChange(flag)
  }
  const handleChangeText = (newText: string) => {
    // Track local state in case `onChangeText` is provided and `value` is not
    setText(newText)
    textInputProps?.onChangeText?.(newText)
    if (!typingRef.current) {
      handleTyping(true)
      setTimeout(() => {
        handleTyping(false)
      }, 3000)
    }
  }

  const renderReplyContent = () => {
    if (replyDerived) {
      return <View style={{
        backgroundColor: colors.palette.gray100,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: s(8),
        marginTop: s(8),
        borderRadius: s(24)
      }}>
        <Text>{replyDerived.author.firstName} : </Text>
        {renderReply()}
        <TouchableOpacity
          style={{
            padding: s(2),
            backgroundColor: colors.palette.gray300,
            borderRadius: s(24),
            marginLeft: s(8)
          }}
          onPress={() => {
            onCloseReply && onCloseReply(replyDerived.id)
          }}
        >
          <IconFont name='close' color={'white'} size={18} />
        </TouchableOpacity>
      </View>
    }
    return null
  }

  const renderInput = () => {
    if (enableMultiSelect) {
      return <View style={multiContainer}>
        <TouchableOpacity onPress={() => {
          // 收藏
          onCollectPress && onCollectPress()
        }}>
          <IconFont name='download' color={theme.colors.inputText} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: s(36) }} onPress={() => {
          // 转发
        }}>
          <IconFont name='trash' color={theme.colors.inputText} />
        </TouchableOpacity>
      </View>
    } else {
      return <View style={container}>
        {user &&
          (isAttachmentUploading ? (
            <CircularActivityIndicator
              {...{
                ...attachmentCircularActivityIndicatorProps,
                color: theme.colors.inputText,
                style: marginRight,
              }}
            />
          ) : null)}

        <TextInput
          multiline
          placeholder={translate('chatUI.inputPlaceholder')}
          placeholderTextColor={`${String(theme.colors.inputText)}80`}
          underlineColorAndroid='transparent'
          {...textInputProps}
          style={[input, textInputProps?.style]}
          onChangeText={handleChangeText}
          cursorColor={theme.colors.inputCursorColor}
          value={value}
          onFocus={() => {
            handleTyping(true)
          }}
          onBlur={() => {
            handleTyping(false)
          }}
        />
        {sendButtonVisibilityMode === 'always' ||
          (sendButtonVisibilityMode === 'editing' && user && value.trim()) ? (
          <SendButton onPress={handleSend} />
        ) : (
          !!onAttachmentPress && (
            <AttachmentButton
              {...unwrap(attachmentButtonProps)}
              onPress={onAttachmentPress}
            />
          )
        )}
      </View>
    }
  }

  const renderReply = () => {
    if (!replyDerived) {
      return null
    }
    switch (replyDerived.type) {
      case 'file':
        return <FileMessageReply {...{
          message: replyDerived
        }} />
      case 'video':
        return <VideoMessageReply {...{ message: replyDerived, messageWidth: 100 }} />
      case 'image':
        return <ImageMessageReply
          {...{
            message: replyDerived
          }}
        />
      case 'text':
        return <TextMessageReply message={replyDerived} />
        case 'userCard':
          // return <UserCardReply message={replyDerived} />
        return <Text>【个人名片】</Text>
      default:
        return null
    }
  }


  return (
    <View style={{
      padding: s(12)
    }}>
      {renderInput()}
      {renderReplyContent()}
    </View>


  )
}
