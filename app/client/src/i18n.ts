// i18next 초기화 — 한국어(ko) / 일본어(ja)
// 언어 선택은 localStorage('hasi-lang')에 저장. main.tsx에서 side-effect import로 초기화.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";

export type Lang = "ko" | "ja";

const saved = localStorage.getItem("hasi-lang");
const initialLng: Lang = saved === "ja" || saved === "ko" ? saved : "ko";

i18n.use(initReactI18next).init({
    resources: {
        ko: { translation: ko },
        ja: { translation: ja },
    },
    lng: initialLng,
    fallbackLng: "ko",
    interpolation: { escapeValue: false },   // React가 XSS 처리
    returnEmptyString: false,
});

// 어디서든 언어 변경 + 저장
export const setLanguage = (lng: Lang) => {
    localStorage.setItem("hasi-lang", lng);
    i18n.changeLanguage(lng);
};

// 서버 에러 응답(code)을 번역. 매핑이 없으면 서버 메시지 폴백.
// 사용: tError(error?.error?.code, error?.error?.message)
export const tError = (code?: string, fallback?: string): string => {
    if (code && i18n.exists(`errors.${code}`)) return i18n.t(`errors.${code}`);
    return fallback ?? i18n.t("common.unknownError");
};

export default i18n;
