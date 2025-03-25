import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "app/components";
import { ScreenX } from "app/components/ScreenX";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { App } from "types/app";

type Props = StackScreenProps<App.StackParamList, 'DonateScreen'>;
export const DonateScreen = (props: Props) => {
    const themeColor = useRecoilValue(ColorsState)
    const [chooseIdx, setChooseIdx] = useState(0)
    const { t } = useTranslation("screens")
    const btnStyle = (idx: number,) => {
        if (idx === chooseIdx) {
            return {
                backgroundColor: themeColor.primary,
                color: themeColor.textChoosed
            }
        }
        return {
            backgroundColor: themeColor.secondaryBackground,
            color: themeColor.text
        }

    }
    const $theme = useRecoilValue(ThemeState)
    return <ScreenX title={t('donate.title')} theme={$theme}>
        <ScrollView style={{ flex: 1, paddingVertical: s(20) }}>

            <View style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flex: 0.7,
                paddingHorizontal: s(12)
            }}>
                <View style={{
                    backgroundColor: themeColor.background,
                    borderRadius: s(12),
                    padding: s(12)
                }}>
                    <Text style={{
                        color: themeColor.text,
                        fontSize: s(16),
                    }}>
                        {t('donate.describe')}
                    </Text>
                    <View style={{
                        marginTop: s(46),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Button label="$5"
                            onPress={() => {
                                setChooseIdx(0)
                            }}
                            textStyle={{ ...btnStyle(0), }}
                            containerStyle={{
                                ...btnStyle(0),
                                marginRight: s(12),
                                height: s(36)
                            }} />

                        <Button label="$10"
                            onPress={() => {
                                setChooseIdx(1)
                            }}
                            textStyle={{ ...btnStyle(1), }}
                            containerStyle={{
                                ...btnStyle(1),
                                marginRight: s(12),
                                height: s(36)
                            }} />
                        <Button label="$15"
                            onPress={() => {
                                setChooseIdx(2)
                            }}
                            textStyle={{ ...btnStyle(2), }}
                            containerStyle={{
                                ...btnStyle(2),
                                marginRight: s(12),
                                height: s(36)
                            }} />
                        <Button label="$100"
                            onPress={() => {
                                setChooseIdx(3)
                            }}
                            textStyle={{ ...btnStyle(3), }}
                            containerStyle={{
                                ...btnStyle(3),
                                height: s(36)
                            }} />
                    </View>
                </View>

                <Button label={t('donate.btnPayment')} size="large"
                    fullRounded
                    containerStyle={{
                        backgroundColor: themeColor.primary,
                        marginTop: s(24),
                        width: '100%'
                    }} />
            </View>


            <View style={{
                flex: 1,
                marginTop: s(24),
                alignItems: 'center',
                backgroundColor: themeColor.background,
                borderTopLeftRadius: s(24),
                borderTopRightRadius: s(24),
                padding: s(12)
            }}>
                <Text style={{
                    color: themeColor.text,
                    fontSize: s(18),
                    marginVertical: s(12)
                }}>
                    {t('donate.donateCoin')}
                </Text>
                <Text style={{
                    fontSize: s(14),
                    color: themeColor.text,
                }}>
                    {t('donate.donateCoinDesc')}
                </Text>

                <View style={{
                    width: '100%',
                    marginTop: s(16),
                }}>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                fontSize: s(16),
                                color: themeColor.text,

                            }}>以太坊地址</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label="复制" containerStyle={{
                            backgroundColor: themeColor.primary,
                        }} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>以太坊地址</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label="复制" containerStyle={{
                            backgroundColor: themeColor.primary,
                        }} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>以太坊地址</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label="复制" containerStyle={{
                            backgroundColor: themeColor.primary,
                        }} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>以太坊地址</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label="复制" containerStyle={{
                            backgroundColor: themeColor.primary,
                        }} />

                    </View>

                </View>

            </View>
        </ScrollView>

    </ScreenX>
}
