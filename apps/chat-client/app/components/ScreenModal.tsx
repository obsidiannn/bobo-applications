import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Modal, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload, gestureHandlerRootHOC } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { ScreenX } from "./ScreenX";
export interface ScreenModalType {
    open: () => void;
    close: () => void;
}
const WithHoc = gestureHandlerRootHOC((props: {
    children?: React.ReactNode;
}) => {
    return <View style={{ flex: 1 }}>{props.children}</View>
});
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
    useEffect(() => {
    }, [])
    return (
        <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide">
            <WithHoc>
                <GestureDetector gesture={gesture}>
                    <ScreenX theme={props.theme} title={props.title ?? ''} onLeftPress={() => setVisible(false)} >
                        {props.children}
                    </ScreenX>
                </GestureDetector>
            </WithHoc>
        </Modal>
    )

})