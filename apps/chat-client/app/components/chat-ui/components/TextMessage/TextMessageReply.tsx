import { Text } from "react-native"
import { MessageType } from '../../types'
export const TextMessageReply = (props: {
    message: MessageType.Any
}) => {
    const replyMsg = props.message as MessageType.Text
    return <Text style={{
    }}>
        {replyMsg.text}
    </Text>
}