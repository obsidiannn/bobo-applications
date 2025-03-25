
import { IModel } from "@repo/enums"
import i18n from 'i18next'

const genderValue = (code: number | undefined | null): string => {
    if (!code) {
        return i18n.t('profile.status_gender_unknown', { ns: 'screens' })
    }
    if (code === IModel.IUser.Gender.FEMALE) {
        return i18n.t('profile.status_gender_female', { ns: 'screens' })
    } else if (code === IModel.IUser.Gender.MALE) {
        return i18n.t('profile.status_gender_male', { ns: 'screens' })
    } else {
        return i18n.t('profile.status_gender_unknown', { ns: 'screens' })
    }
}




export default {
    genderValue,
}