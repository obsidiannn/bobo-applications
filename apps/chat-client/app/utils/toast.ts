import * as Burnt from "burnt";
import { Platform } from "react-native";

export default (message: string) => {
    Burnt.toast({
        title: Platform.OS =="android" ? message : "",
        preset: "done",
        message: Platform.OS =="android" ? '' : message,
        duration: 2,
    });
}