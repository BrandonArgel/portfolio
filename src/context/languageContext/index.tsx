import { createContext, useEffect, useState } from "react";
import { useLocalStorage } from "@hooks";
import translationsRaw from "@utils/translations.json";
const translations = JSON.parse(JSON.stringify(translationsRaw));

const userLanguage = () => {
	const language = navigator.language.split("-")[0];
	return language in translations ? language : "en";
};

const initialLanguage = userLanguage();

export type Languages = "en" | "es" | "fr";

type wildcardProps = {
	[key: string]: any;
};

interface LanguageContextProps {
	children: React.ReactNode;
}

const LanguageContext = createContext({
	texts: {} as wildcardProps,
	language: "",
	setLanguage: (lang: Languages) => {},
});

const LanguageProvider = ({ children }: LanguageContextProps) => {
	const [language, setLanguage] = useLocalStorage("language", initialLanguage);
	const [texts, setTexts] = useState(translations[language as keyof typeof translations]);

	const handleLanguage = (lang: Languages) => {
		setLanguage(lang);
		setTexts(translations[lang as keyof typeof translations]);
		// Remove hash from url and the #
		const hash = window.location.hash;
		console.log(hash);
		if (hash) {
			const url = window.location.href;
			const newUrl = url.replace(hash, "");
			window.history.replaceState({}, "", newUrl);
		}
	};

	/**
	 * This function checks if there is a hash of other language, to change the language
	 */
	const handleChangeInitialLanguage = (hash: string) => {
		const otherLanguages = Object.keys(translations).filter((l) => l !== language);

		otherLanguages.forEach((l) => {
			const navItems = Object.values(translations[l as keyof typeof translations].header.nav);
			const lang = navItems.some((item: any) => `#${item.hash}` === hash);
			if (lang) {
				handleLanguage(l as Languages);
			}
		});
	};

	useEffect(() => {
		const hash = window.location.hash;
		const navItems = Object.values(texts.header.nav);
		const lang = navItems.some((item: any) => `#${item.hash}` === hash);
		if (lang) return;
		handleChangeInitialLanguage(hash);
	}, []);

	return (
		<LanguageContext.Provider
			value={{
				texts,
				language,
				setLanguage: handleLanguage,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export { LanguageContext, LanguageProvider };
