import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "./locales/ru.json";
import en from "./locales/en.json";
import kz from "./locales/kz.json";

const savedLanguage = localStorage.getItem("language");
const language = savedLanguage === "kz" ? "kk" : savedLanguage;

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    kk: { translation: kz },
  },
  lng: ["ru", "en", "kk"].includes(language) ? language : "ru",
  fallbackLng: "ru",
  supportedLngs: ["ru", "en", "kk"],
  // Original Russian messages are shared translation keys, including punctuation.
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("language", language);
});

export default i18n;
