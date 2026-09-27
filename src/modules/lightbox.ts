import {
  asset,
  contactEmail,
  getSlides,
  workDescription,
  workMaterials,
  workStatus,
  workTitle,
  workLead,
  type Slide,
} from './content'
import { updateUrl } from './url'
import { t } from '../i18n'

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
  const write = document.getElementById('lightbox-write') as HTMLAnchorElement
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
    thumbs.style.setProperty('--count', String(siblings.length))
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
    // кадров может быть два десятка: полоса прокручивается, и текущую
    // миниатюру нужно подвести в середину — положение считаем сами, потому
    // что снимки в полосе догружаются и браузер промахивается
    const active = thumbs.querySelector<HTMLElement>('.lightbox-thumb[aria-current="true"]')
    if (active) {
      // при открытии по ссылке полоса ещё не разложена и промахивается,
      // поэтому доводим несколько раз
      const center = () => {
        if (thumbs.scrollHeight > thumbs.clientHeight + 2) {
          thumbs.scrollTop = active.offsetTop - (thumbs.clientHeight - active.offsetHeight) / 2
        } else if (thumbs.scrollWidth > thumbs.clientWidth + 2) {
          thumbs.scrollLeft = active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2
        }
      }
      requestAnimationFrame(center)
      setTimeout(center, 160)
      setTimeout(center, 420)
    }
  }

  const show = (i: number) => {
    const slides = getSlides()
    index = (i + slides.length) % slides.length
    const { work, image: picture, position, total } = slides[index]

    image.src = asset(picture.large)
    image.alt = workTitle(work)
    title.textContent = workTitle(work)
    meta.textContent = [workMaterials(work), workStatus(work), workLead(work), total > 1 ? `${position} / ${total}` : '']
      .filter(Boolean)
      .join(' · ')
    description.textContent = workDescription(work)

    // письмо открывается с названием работы в теме: человеку не нужно
    // объяснять, о чём он пишет
    const sold = work.status === 'sold'
    write.textContent = t(sold ? 'gallery.writeSimilar' : 'gallery.write')
    const subject = `${workTitle(work)} — ${t(sold ? 'gallery.mailSimilar' : 'gallery.mailAsk')}`
    write.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`

    updateUrl({ work: work.id, photo: String(position) })

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
    updateUrl({ work: null, photo: null }, '#gallery')
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
