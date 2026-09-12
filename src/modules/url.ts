/**
 * Адрес страницы отражает то, что человек видит: раздел, открытую работу,
 * номер кадра и язык. Тогда ссылка, отправленная другому, открывается
 * ровно на том же месте, а не в начале сайта.
 */
export function updateUrl(changes: Record<string, string | null>, hash?: string): void {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  if (hash !== undefined) url.hash = hash
  window.history.replaceState(null, '', url)
}

/** Пока сайт доводит прокрутку до раздела из ссылки, подсветка не трогает адрес. */
let sectionLocked = false

export function lockSection(ms: number): void {
  sectionLocked = true
  window.setTimeout(() => { sectionLocked = false }, ms)
}

export function updateSection(id: string): void {
  if (sectionLocked) return
  updateUrl({}, `#${id}`)
}

export function readUrl(): { lang: string | null; work: string | null; photo: number | null } {
  const p = new URLSearchParams(window.location.search)
  const photo = Number(p.get('photo'))
  return {
    lang: p.get('lang'),
    work: p.get('work'),
    photo: Number.isFinite(photo) && photo > 0 ? photo : null,
  }
}
