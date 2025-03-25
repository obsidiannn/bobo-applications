import { s } from "app/utils/size"
import { useTranslation } from "react-i18next"
import { View, ActivityIndicator, Text } from "react-native"

const LoadingComponent = (props: {
    label?: string
}) => {
    const { t } = useTranslation('components')
    return <View style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <ActivityIndicator size="large" color="black" />
        <Text style={{ fontWeight: 400, marginTop: s(28) }}>
            {props.label ?? t('loading.labelDefaultLoading')}
        </Text>
    </View>
}

export default LoadingComponent
