import {
  asset,
  getSlides,
  workDescription,
  workMaterials,
  workStatus,
  workTitle,
} from './content'

/** Полноэкранный просмотр: стрелки идут по всем снимкам всех работ подряд. */
export function createLightbox(): (index: number) => void {
  const root = document.getElementById('lightbox')!
  const image = document.getElementById('lightbox-image') as HTMLImageElement
  const title = document.getElementById('lightbox-title')!
  const meta = document.getElementById('lightbox-meta')!
  const description = document.getElementById('lightbox-description')!
  let index = 0
  let lastFocused: HTMLElement | null = null

  const show = (i: number) => {
    const slides = getSlides()
    index = (i + slides.length) % slides.length
    const { work, image: picture, position, total } = slides[index]
    image.src = asset(picture.large)
    image.alt = workTitle(work)
    title.textContent = workTitle(work)
    meta.textContent = [
      workMaterials(work),
      workStatus(work),
      total > 1 ? `${position} / ${total}` : '',
    ]
      .filter(Boolean)
      .join(' · ')
    description.textContent = workDescription(work)
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
