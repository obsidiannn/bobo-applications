import { Screen } from "app/components"
import { ColorsState } from "app/stores/system"

import { Text,View } from "react-native"
import { useRecoilValue } from "recoil"
import { StackScreenProps } from "@react-navigation/stack"
type Props = StackScreenProps<App.StackParamList, 'WalletScreen'>;
export const WalletScreen = ({ navigation }: Props) => {
  const $colors = useRecoilValue(ColorsState);
  return <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={$colors.background}>
    <View>
        <Text>wallet</Text>
    </View>
  </Screen>
}
