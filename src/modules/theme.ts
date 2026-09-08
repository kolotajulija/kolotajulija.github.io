type Theme = 'light' | 'dark'
const KEY = 'jk-theme'

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* приватный режим */
  }
}

export function initTheme(): void {
  apply(stored() ?? systemTheme())

  // Пока пользователь не выбрал тему руками — следуем за системной.
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!stored()) apply(e.matches ? 'light' : 'dark')
  })

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    apply(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light')
  })
}
