import './styles/main.css'
import { LANGS } from './i18n/config'
import { getLang, initI18n, onLangChange, setLang } from './i18n'
import { initTheme } from './modules/theme'
import { initNav } from './modules/nav'
import { initReveal } from './modules/reveal'
import { renderContacts, renderGallery, renderProcess, renderTestimonials } from './modules/content'
import { createLightbox } from './modules/lightbox'

function renderLangSwitch(): void {
  const host = document.getElementById('lang-switch')!
  host.replaceChildren(
    ...LANGS.map((lang) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'lang-btn'
      button.textContent = lang.label
      button.setAttribute('aria-pressed', String(lang.code === getLang()))
      button.addEventListener('click', () => setLang(lang.code))
      return button
    }),
  )
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
}

main()
