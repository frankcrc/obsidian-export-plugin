import { getLanguage as getObsidianLanguage } from 'obsidian';
import { en, type TranslationKey } from './en';
import { zh } from './zh';

export type { TranslationKey };

export type SupportedLanguage = 'en' | 'zh';
export type LanguagePreference = 'auto' | SupportedLanguage;

export type TranslationParams = Record<string, string | number>;

const dictionaries: Record<SupportedLanguage, Record<TranslationKey, string>> = {
	en,
	zh,
};

let currentLanguage: SupportedLanguage = 'en';

export function isLanguagePreference(value: string): value is LanguagePreference {
	return value === 'auto' || value === 'en' || value === 'zh';
}

/**
 * Applies the language preference and returns the language that is now active.
 */
export function setLanguage(preference: LanguagePreference): SupportedLanguage {
	currentLanguage = preference === 'auto' ? detectLanguage() : preference;
	return currentLanguage;
}

export function getActiveLanguage(): SupportedLanguage {
	return currentLanguage;
}

export function t(key: TranslationKey, params?: TranslationParams): string {
	const template = dictionaries[currentLanguage][key];
	if (!params) {
		return template;
	}
	return template.replace(/\{(\w+)\}/gu, (match, name: string) => {
		const value = params[name];
		return value === undefined ? match : String(value);
	});
}

function detectLanguage(): SupportedLanguage {
	return normalizeLanguage(getObsidianLanguage());
}

function normalizeLanguage(locale: string): SupportedLanguage {
	return locale.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
