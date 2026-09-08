import { asset, getWorks, workCaption } from './content'
import { getLang } from '../i18n'

/** Полноэкранный просмотр работ: стрелки, Esc, клик по фону. */
export function createLightbox(): (index: number) => void {
  const root = document.getElementById('lightbox')!
  const image = document.getElementById('lightbox-image') as HTMLImageElement
  const caption = document.getElementById('lightbox-caption')!
  let index = 0
  let lastFocused: HTMLElement | null = null

  const show = (i: number) => {
    const works = getWorks()
    index = (i + works.length) % works.length
    const work = works[index]
    image.src = asset(work.image)
    image.alt = work.title[getLang()] ?? work.title.en ?? ''
    caption.textContent = `${image.alt} — ${workCaption(work)}`
  }

  const open = (i: number) => {
    lastFocused = document.activeElement as HTMLElement | null
    show(i)
    root.classList.add('is-open')
    root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('is-locked')
    ;(document.getElementById('lightbox-close') as HTMLButtonElement).focus()
  }

  const close = () => {
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('is-locked')
    lastFocused?.focus()
  }

  document.getElementById('lightbox-close')!.addEventListener('click', close)
  document.getElementById('lightbox-prev')!.addEventListener('click', () => show(index - 1))
  document.getElementById('lightbox-next')!.addEventListener('click', () => show(index + 1))
  root.addEventListener('click', (e) => {
    if (e.target === root) close()
  })
  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('is-open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') show(index - 1)
    if (e.key === 'ArrowRight') show(index + 1)
  })

  return open
}
