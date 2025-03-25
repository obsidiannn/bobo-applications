import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Text, TextStyle, View, ViewStyle } from "react-native";
import { s } from "app/utils/size";
import { Button, Card } from "app/components";
import { $colors } from "app/Colors";
import { useTranslation } from "react-i18next";
export interface ConfirmModalOption {
  title: string;
  content: string;
  onSubmit?: () => Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmModalType {
  open: (option: ConfirmModalOption) => void,
  close: () => void
}
export const ConfirmModal = forwardRef((props: {
  theme?: 'light' | 'dark';
}, ref) => {
  const [visible, setVisible] = useState(false);
  const { theme = 'light' } = props;
  const [option, setOption] = useState<ConfirmModalOption>({
    title: "",
    content: "",
  })
  useImperativeHandle(ref, () => ({
    open: (option: ConfirmModalOption) => {
      setVisible(true);
      setOption(option)
    },
    close: async () => setVisible(false)
  }));
  const { t } = useTranslation('default');
  return (
    <Modal transparent={true} style={{ flex: 1 }} visible={visible} animationType="slide" >
      <View style={$container}>
        <Card theme={theme} rounded>
          <View style={$titleContainer}>
            <Text style={[$title, { color: $colors.text }]}>{option.title}</Text>
          </View>
          <Text style={[$content, { color: $colors.secondaryText }]}>{option.content}</Text>
          <View>
            <Button theme={theme}
              onPress={async () => {
                if (option.onSubmit) {
                  await option.onSubmit()
                }
                setVisible(false)
              }} containerStyle={{
                marginTop: s(15)
              }} fullRounded size="large" label={t("Confirm")} />
            <Button theme={theme} onPress={() => setVisible(false)} containerStyle={{
              marginVertical: s(15)
            }} fullRounded type="secondary" size="large" label={t("Cancel")} />
          </View>
        </Card>
      </View>
    </Modal>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#000000cc",
  alignItems: "center",
  paddingHorizontal: s(16),
  justifyContent: "center"
}
const $titleContainer: ViewStyle = {
  marginVertical: s(16)
}
const $title: TextStyle = {
  fontSize: s(16),
  fontWeight: "500",
  textAlign: "center"
}
const $content: TextStyle = {
  fontSize: s(14),
  marginHorizontal: s(15)
}
