import { Text, View, ViewStyle } from "react-native";
import BlockButton from "../../BlockButton";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { useTranslation } from "react-i18next";
export interface CameraPermissionViewProps {
    requestPermission: () => void
}
export const CameraPermissionView = (props: CameraPermissionViewProps) => {
    const $colors = useRecoilValue(ColorsState);
    const { t } = useTranslation('components')
    return <View style={$container}>
        <View style={$buttonContainer}>
            <BlockButton onPress={() => {
                console.log("requestPermission")
                props.requestPermission()
            }} type="primary" label={t('common.btnRequireCameraPermission')} />
        </View>
        <Text style={[$tipsText, {
            color: $colors.text
        }]}>{t('common.btnRequireCameraPermissionDesc')}</Text>
    </View>
}
const $container: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
}
const $buttonContainer: ViewStyle = {
    height: s(50),
    width: s(343),
    marginHorizontal: s(16),
}
const $tipsText = {
    marginTop: s(20),
}