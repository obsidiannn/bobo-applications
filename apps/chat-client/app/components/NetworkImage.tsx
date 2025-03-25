import fileService from "app/services/file.service";
import { Image, ImageProps } from "expo-image";

export const NetworkImage = (props: {
    uri: string;
    style?: ImageProps["style"];
}) => {
  return (
    <Image
      contentFit="contain"
      source={{uri: fileService.getFullUrl(props.uri)}}
      style={props.style}
      cachePolicy="disk"
    />
  );
}