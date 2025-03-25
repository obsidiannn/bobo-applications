import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { MessageType, Size } from '../../types'
import { imageReduce, s } from 'app/utils/size'
import fileService from 'app/services/file.service'

export interface ImageMessageReplyProps {
    message: MessageType.DerivedImage
}

/** Image message component. Supports different
 * aspect ratios, renders blurred image as a background which is visible
 * if the image is narrow, renders image in form of a file if aspect
 * ratio is very small or very big. */
export const ImageMessageReply = ({ message }: ImageMessageReplyProps) => {

    const renderImage = () => {
        const { w, h } = imageReduce(message.width ?? 0, message.height ?? 0, 100)
        return (
            <Image
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: fileService.getFullUrl(message.uri) }}
                style={{
                    width: w,
                    height: h,
                    borderRadius: s(8)
                }}
            />
        )
    }

    return (renderImage())
}
