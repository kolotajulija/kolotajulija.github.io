import { DEFAULT_LANG, LANGS, LANG_STORAGE_KEY, type LangCode } from './config'

export type { LangCode }

type Dict = Record<string, unknown>

// Все словари подтягиваются автоматически — достаточно положить файл в locales/.
const modules = import.meta.glob<{ default: Dict }>('./locales/*.json', { eager: true })

const dictionaries: Partial<Record<LangCode, Dict>> = {}
for (const [path, mod] of Object.entries(modules)) {
  const code = path.split('/').pop()!.replace('.json', '') as LangCode
  dictionaries[code] = mod.default
}

const supported = LANGS.map((l) => l.code) as readonly LangCode[]
let current: LangCode = DEFAULT_LANG

const listeners = new Set<(lang: LangCode) => void>()

function read(dict: Dict | undefined, key: string): unknown {
  if (!dict) return undefined
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Dict)) return (acc as Dict)[part]
    return undefined
  }, dict)
}

/** Значение по ключу вида "hero.title"; при отсутствии — фолбэк на язык по умолчанию. */
export function t(key: string): string {
  const value = read(dictionaries[current], key) ?? read(dictionaries[DEFAULT_LANG], key)
  return typeof value === 'string' ? value : key
}

/** То же, но для массивов/объектов (списки шагов процесса и т. п.). */
export function tRaw<T>(key: string): T | undefined {
  return (read(dictionaries[current], key) ?? read(dictionaries[DEFAULT_LANG], key)) as T | undefined
}

export function getLang(): LangCode {
  return current
}

export function onLangChange(fn: (lang: LangCode) => void): void {
  listeners.add(fn)
}

function detectLang(): LangCode {
  // язык из ссылки главнее: человек прислал адрес на своём языке
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl && supported.includes(fromUrl as LangCode)) return fromUrl as LangCode

  let stored: string | null = null
  try {
    stored = localStorage.getItem(LANG_STORAGE_KEY)
  } catch {
    /* приватный режим — просто игнорируем */
  }
  if (stored && supported.includes(stored as LangCode)) return stored as LangCode

  for (const nav of navigator.languages ?? [navigator.language]) {
    const short = nav.slice(0, 2).toLowerCase() as LangCode
    if (supported.includes(short)) return short
  }
  return DEFAULT_LANG
}

/** Проставляет переводы во все элементы с data-i18n* атрибутами. */
export function applyTranslations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n!)
    if (el instanceof HTMLMetaElement) el.content = value
    else el.textContent = value
  })
  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml!)
  })
  root.querySelectorAll<HTMLElement>('[data-i18n-alt]').forEach((el) => {
    el.setAttribute('alt', t(el.dataset.i18nAlt!))
  })
  root.querySelectorAll<HTMLElement>('[data-i18n-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel!))
  })
}

export function setLang(lang: LangCode): void {
  current = supported.includes(lang) ? lang : DEFAULT_LANG
  const meta = LANGS.find((l) => l.code === current)!
  document.documentElement.lang = meta.htmlLang
  document.title = t('meta.title')
  try {
    localStorage.setItem(LANG_STORAGE_KEY, current)
  } catch {
    /* игнорируем */
  }
  applyTranslations()
  const url = new URL(window.location.href)
  url.searchParams.set('lang', current)
  window.history.replaceState(null, '', url)
  listeners.forEach((fn) => fn(current))
}

export function initI18n(): void {
  setLang(detectLang())
}
