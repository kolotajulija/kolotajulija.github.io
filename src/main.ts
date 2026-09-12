import './styles/main.css'
import { LANGS } from './i18n/config'
import { getLang, initI18n, onLangChange, setLang, t } from './i18n'
import { initTheme } from './modules/theme'
import { initNav } from './modules/nav'
import { initReveal } from './modules/reveal'
import { renderContacts, renderGallery, renderProcess, renderTestimonials } from './modules/content'
import { createLightbox } from './modules/lightbox'
import { getSlides } from './modules/content'
import { lockSection, readUrl, updateUrl } from './modules/url'

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
  // адрес читаем до отрисовки: подсветка разделов вскоре перепишет хеш
  const wanted = location.hash.length > 1 ? location.hash : ''

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

  // ссылка может указывать на конкретную работу и кадр — открываем их сразу
  const { work, photo } = readUrl()
  if (work) {
    const slides = getSlides()
    const index = slides.findIndex((s) => s.work.id === work && s.position === (photo ?? 1))
    if (index >= 0) openLightbox(index)
  } else if (wanted) {
    // разделы собираются скриптом, а снимки подгружаются лениво, поэтому
    // страница дорастает уже после перехода по ссылке: доводим прокрутку,
    // пока раздел не встанет на место
    const target = document.querySelector<HTMLElement>(wanted)
    if (target) {
      lockSection(1600)
      const snap = () => target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
      snap()
      ;[0, 120, 350, 700, 1200, 1500].forEach((ms) => setTimeout(snap, ms))
      window.addEventListener('load', () => setTimeout(snap, 60), { once: true })
      setTimeout(() => updateUrl({}, wanted), 1550)
    }
  }

  document.getElementById('year')!.textContent = String(new Date().getFullYear())

  const version = document.getElementById('footer-version')
  if (version) version.textContent = `v${__APP_VERSION__}`
}

main()
