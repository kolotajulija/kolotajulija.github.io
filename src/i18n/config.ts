/**
 * Список языков сайта. Чтобы ДОБАВИТЬ язык:
 *   1) создать src/i18n/locales/<code>.json (скопировав en.json),
 *   2) дописать строчку сюда.
 * Чтобы УБРАТЬ — удалить строчку отсюда (файл можно оставить).
 * Порядок здесь = порядок кнопок в шапке.
 */
export const LANGS = [
  { code: 'en', label: 'EN', htmlLang: 'en' },
  { code: 'ru', label: 'RU', htmlLang: 'ru' },
  { code: 'lv', label: 'LV', htmlLang: 'lv' },
] as const

export type LangCode = (typeof LANGS)[number]['code']

/** Язык по умолчанию, если у посетителя не подходит ни один системный. */
export const DEFAULT_LANG: LangCode = 'en'

export const LANG_STORAGE_KEY = 'jk-lang'
