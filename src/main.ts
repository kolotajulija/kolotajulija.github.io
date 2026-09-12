import './styles/main.css'
import { LANGS } from './i18n/config'
import { getLang, initI18n, onLangChange, setLang, t } from './i18n'
import { initTheme } from './modules/theme'
import { initNav } from './modules/nav'
import { initReveal } from './modules/reveal'
import { renderContacts, renderGallery, renderProcess, renderTestimonials } from './modules/content'
import { createLightbox } from './modules/lightbox'

/** Языки прячутся под одну кнопку: в шапке видно только текущий. */
let langListeners: AbortController | null = null

function renderLangSwitch(): void {
  const host = document.getElementById('lang-switch')!
  langListeners?.abort()
  langListeners = new AbortController()
  const { signal } = langListeners
  const current = LANGS.find((l) => l.code === getLang()) ?? LANGS[0]

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'lang-current'
  trigger.setAttribute('aria-haspopup', 'true')
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-label', t('nav.language'))
  trigger.textContent = current.label

  const menu = document.createElement('ul')
  menu.className = 'lang-menu'
  menu.hidden = true
  menu.append(
    ...LANGS.map((lang) => {
      const li = document.createElement('li')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'lang-btn'
      button.textContent = lang.label
      button.setAttribute('aria-pressed', String(lang.code === getLang()))
      button.addEventListener('click', () => {
        setLang(lang.code)
        close()
      })
      li.append(button)
      return li
    }),
  )

  const close = () => {
    menu.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation()
    menu.hidden = !menu.hidden
    trigger.setAttribute('aria-expanded', String(!menu.hidden))
  })
  document.addEventListener('click', close, { signal })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  }, { signal })

  host.replaceChildren(trigger, menu)
}

function main(): void {
  initTheme()
  initI18n()

  const openLightbox = createLightbox()

  const renderAll = () => {
    renderLangSwitch()
    renderGallery(openLightbox)
    renderProcess()
    renderTestimonials()
    renderContacts()
  }

  renderAll()
  onLangChange(renderAll)

  initNav()
  initReveal()

  document.getElementById('year')!.textContent = String(new Date().getFullYear())

  const version = document.getElementById('footer-version')
  if (version) {
    const [y, m, d] = __BUILD_DATE__.split('-')
    version.textContent = `v${__APP_VERSION__} · ${d}.${m}.${y}`
  }
}

main()
