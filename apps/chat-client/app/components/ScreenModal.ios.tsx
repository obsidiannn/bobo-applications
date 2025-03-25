import { forwardRef, useImperativeHandle, useState } from "react"
import { Modal, ViewStyle } from "react-native"
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { ScreenX } from "./ScreenX";
export interface ScreenModalType {
    open: () => void;
    close: () => void;
}
export const ScreenModal = forwardRef((props: {
    style?: ViewStyle;
    title?: string
    children?: React.ReactNode;
    theme: "light" | "dark";
}, ref) => {
    const [visible, setVisible] = useState(false);
    const onSwipeEnd = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.translationX > 0) {
            console.log("swipe end");
            setVisible(false)
        }
    };
    const gesture = Gesture.Pan().onEnd((event) => runOnJS(onSwipeEnd)(event));
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    return (
        <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide">
            <GestureDetector gesture={gesture}>
                <ScreenX theme={props.theme} title={props.title ?? '1'} onLeftPress={() => setVisible(false)} >
                    {props.children}
                </ScreenX>
            </GestureDetector>
        </Modal>
    )

})