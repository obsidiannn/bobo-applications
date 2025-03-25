import { $dark, $light } from "app/theme";
import { globalStorage } from "app/utils/kv-tool";
import { atom, selector } from "recoil";

export const ThemeState = atom<'dark' | 'light'>({
    key: "Theme",
    default: "light",
});
export const LangState = atom<string>({
    key: "Lang",
    default: "en",
    effects_UNSTABLE: [
        ({ setSelf, onSet }) => {
            onSet((newValue) => {
                globalStorage.set('Lang', newValue);
            })
        },
    ]
});
export const ColorsState = selector({
    key: 'ColorsState',
    get: ({ get }) => {
        const themeState = get(ThemeState);

        return themeState == "dark" ? $dark : $light;
    },
});
export const NetworkState = atom<boolean>({
    key: "Network",
    default: false,
})