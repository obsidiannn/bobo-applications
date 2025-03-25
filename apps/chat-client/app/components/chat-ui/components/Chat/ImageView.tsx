import * as React from 'react'
import { ImageRequireSource, ImageURISource, View } from 'react-native'
import { ImageSource } from 'react-native-image-viewing/dist/@types'

interface Props {
  imageIndex: number
  images: Array<ImageURISource | ImageRequireSource>
  onRequestClose: () => void
  visible: boolean
  onLongPress?: (image: ImageSource) => void
  FooterComponent?: React.ComponentType<{
    imageIndex: number;
}>;
}

const ImageView = (_: Props) => {
  return <View />
}

export default ImageView
