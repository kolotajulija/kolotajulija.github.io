import {
  asset,
  getSlides,
  workDescription,
  workMaterials,
  workStatus,
  workTitle,
  workLead,
  workCollection,
  type Slide,
} from './content'

/**
 * Полноэкранный просмотр. Листать можно четырьмя способами: стрелками по краям,
 * клавишами, миниатюрами под снимком и свайпом на телефоне. Клик по самому
 * снимку тоже перелистывает — так делают почти все, кто впервые открыл галерею.
 */
export function createLightbox(): (index: number) => void {
  const root = document.getElementById('lightbox')!
  const image = document.getElementById('lightbox-image') as HTMLImageElement
  const title = document.getElementById('lightbox-title')!
  const meta = document.getElementById('lightbox-meta')!
  const description = document.getElementById('lightbox-description')!
  const thumbs = document.getElementById('lightbox-thumbs')!
  const prev = document.getElementById('lightbox-prev') as HTMLButtonElement
  const next = document.getElementById('lightbox-next') as HTMLButtonElement

  let index = 0
  let lastFocused: HTMLElement | null = null

  /** Индексы всех кадров той же работы — по ним строится полоска миниатюр. */
  const siblingsOf = (slides: Slide[], current: number): number[] =>
    slides.reduce<number[]>((acc, slide, i) => {
      if (slide.work.id === slides[current].work.id) acc.push(i)
      return acc
    }, [])

  const renderThumbs = (slides: Slide[], siblings: number[]) => {
    if (siblings.length < 2) {
      thumbs.replaceChildren()
      return
    }
    thumbs.replaceChildren(
      ...siblings.map((slideIndex) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'lightbox-thumb'
        button.setAttribute('aria-current', String(slideIndex === index))
        const img = document.createElement('img')
        img.src = asset(slides[slideIndex].image.small)
        img.alt = ''
        button.append(img)
        button.addEventListener('click', () => show(slideIndex))
        return button
      }),
    )
  }

  const show = (i: number) => {
    const slides = getSlides()
    index = (i + slides.length) % slides.length
    const { work, image: picture, position, total } = slides[index]

    image.src = asset(picture.large)
    image.alt = workTitle(work)
    const collection = document.getElementById('lightbox-collection')!
    collection.textContent = workCollection(work)
    collection.hidden = !workCollection(work)
    title.textContent = workTitle(work)
    meta.textContent = [workMaterials(work), workStatus(work), workLead(work), total > 1 ? `${position} / ${total}` : '']
      .filter(Boolean)
      .join(' · ')
    description.textContent = workDescription(work)

    const single = slides.length < 2
    prev.hidden = single
    next.hidden = single
    renderThumbs(slides, siblingsOf(slides, index))
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
  prev.addEventListener('click', () => show(index - 1))
  next.addEventListener('click', () => show(index + 1))
  image.addEventListener('click', () => show(index + 1))

  const scroll = document.getElementById('lightbox-scroll')!
  scroll.addEventListener('click', (e) => {
    if (e.target === scroll) close()
  })

  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('is-open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') show(index - 1)
    if (e.key === 'ArrowRight') show(index + 1)
  })

  // свайп на телефоне
  let touchStartX = 0
  root.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX
  }, { passive: true })
  root.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 45) show(delta < 0 ? index + 1 : index - 1)
  }, { passive: true })

  return open
}
