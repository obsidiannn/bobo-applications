import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { MessageType, Size } from '../../types'
import { formatBytes, ThemeContext, UserContext } from '../../utils'
import styles from './styles'
import fileService from 'app/services/file.service'
import { NetworkImage } from 'app/components/NetworkImage'
import { imageReduce } from 'app/utils/size'

export interface ImageMessageProps {
  message: MessageType.DerivedImage
  /** Maximum message width */
  messageWidth: number
}

/** Image message component. Supports different
 * aspect ratios, renders blurred image as a background which is visible
 * if the image is narrow, renders image in form of a file if aspect
 * ratio is very small or very big. */
export const ImageMessage = ({ message, messageWidth }: ImageMessageProps) => {
  const theme = React.useContext(ThemeContext)
  const user = React.useContext(UserContext)
  const defaultHeight = message.height ?? 0
  const defaultWidth = message.width ?? 0
  
  const size = imageReduce(defaultWidth, defaultHeight, messageWidth)
  console.log('messageWidth=', size);

  const aspectRatio = size.w / (size.h || 1)
  const isMinimized = false
  // const isMinimized = aspectRatio < 0.1 || aspectRatio > 10
  const {
    minimizedImageContainer,
    nameText,
    sizeText,
    textContainer,
  } = styles({
    aspectRatio,
    message,
    messageWidth,
    theme,
    user,
  })

  const renderImage = () => {
    console.log('renderImage', isMinimized);

    return (
      <Image
        // uri={fileService.getFullUrl(message.uri)}
        accessibilityRole='image'
        resizeMode={'cover'}
        source={{ uri: fileService.getFullUrl(message.uri) }}
        style={{
          width: size.w, 
          height: size.h
        }
          // isMinimized
          //   ? minimizedImage
          //   : aspectRatio < 1
          //     ? verticalImage
          //     : horizontalImage
        }
      />
    )
  }

  return isMinimized ? (
    <View style={minimizedImageContainer}>
      {renderImage()}
      <View style={textContainer}>
        <Text style={nameText}>{message.name}</Text>
        <Text style={sizeText}>{formatBytes(message.size)}</Text>
      </View>
    </View>
  ) : (
    <View style={minimizedImageContainer}>
      {renderImage()}
    </View>
  )
}
