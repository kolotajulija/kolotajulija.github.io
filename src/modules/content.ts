import worksData from '../data/works.json'
import contactsData from '../data/contacts.json'
import { getLang, t, tRaw, type LangCode } from '../i18n'

type Localized = Partial<Record<LangCode, string>>
type WorkImage = { small: string; large: string }
type Work = {
  id: string
  status: 'available' | 'sold'
  images: WorkImage[]
  title: Localized
  materials: Localized
  description: Localized
  collection?: Localized
}
type Contact = { key: string; value: string; href: string }
type Step = { title: string; text: string }

/** Один кадр в лайтбоксе: сам снимок и работа, которой он принадлежит. */
export type Slide = { work: Work; image: WorkImage; position: number; total: number }

const works = worksData as Work[]
const contacts = contactsData as Contact[]

/** Путь к файлу в public/ с учётом base (важно для GitHub Pages). */
export function asset(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}

function localized(value: Localized): string {
  return value[getLang()] ?? value.en ?? ''
}

export const workTitle = (w: Work) => localized(w.title)
export const workCollection = (w: Work) => (w.collection ? localized(w.collection) : '')
export const workMaterials = (w: Work) => localized(w.materials)
export const workDescription = (w: Work) => localized(w.description)
export const workStatus = (w: Work) => t(w.status === 'sold' ? 'gallery.sold' : 'gallery.available')

/** Все снимки всех работ одной лентой — по ней и ходят стрелки лайтбокса. */
export function getSlides(): Slide[] {
  return works.flatMap((work) =>
    work.images.map((image, i) => ({ work, image, position: i + 1, total: work.images.length })),
  )
}

export function renderGallery(onOpen: (slideIndex: number) => void): void {
  const grid = document.getElementById('gallery-grid')!
  let slideIndex = 0

  grid.replaceChildren(
    ...works.map((work) => {
      const firstSlide = slideIndex
      slideIndex += work.images.length

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'work'
      button.setAttribute('aria-label', `${workTitle(work)} — ${t('gallery.open')}`)

      const frame = document.createElement('div')
      frame.className = 'work-frame'

      const img = document.createElement('img')
      const cover = work.images[0]
      img.src = asset(cover.small)
      img.srcset = `${asset(cover.small)} 800w, ${asset(cover.large)} 1600w`
      img.sizes = '(max-width: 860px) 100vw, 30vw'
      img.alt = workTitle(work)
      img.loading = 'lazy'
      img.decoding = 'async'
      frame.append(img)

      const status = document.createElement('span')
      status.className = `work-status work-status-${work.status}`
      status.textContent = workStatus(work)
      frame.append(status)

      if (work.images.length > 1) {
        const count = document.createElement('span')
        count.className = 'work-count'
        count.textContent = String(work.images.length)
        frame.append(count)
      }

      const caption = document.createElement('span')
      caption.className = 'work-caption'

      const line = document.createElement('span')
      line.className = 'work-collection'
      line.textContent = workCollection(work)
      caption.append(line)

      const title = document.createElement('span')
      title.className = 'work-title'
      title.textContent = workTitle(work)

      const meta = document.createElement('span')
      meta.className = 'work-meta'
      meta.textContent = workMaterials(work)

      caption.append(title, meta)
      button.append(frame, caption)
      button.addEventListener('click', () => onOpen(firstSlide))
      return button
    }),
  )
}

export function renderProcess(): void {
  const list = document.getElementById('process-list')!
  const steps = tRaw<Step[]>('process.steps') ?? []
  list.replaceChildren(
    ...steps.map((step) => {
      const li = document.createElement('li')
      const h3 = document.createElement('h3')
      h3.textContent = step.title
      const p = document.createElement('p')
      p.textContent = step.text
      li.append(h3, p)
      return li
    }),
  )
}

export function renderContacts(): void {
  const list = document.getElementById('contact-list')!
  list.replaceChildren(
    ...contacts.map((contact) => {
      const li = document.createElement('li')
      const wrapper = contact.href ? document.createElement('a') : document.createElement('div')
      if (wrapper instanceof HTMLAnchorElement) {
        wrapper.href = contact.href
        if (contact.href.startsWith('http')) {
          wrapper.target = '_blank'
          wrapper.rel = 'noopener noreferrer'
        }
      } else {
        wrapper.className = 'contact-static'
      }

      const label = document.createElement('span')
      label.className = 'contact-label'
      label.textContent = t(`contact.labels.${contact.key}`)

      const value = document.createElement('span')
      value.className = 'contact-value'
      value.textContent = contact.value

      wrapper.append(label, value)
      li.append(wrapper)
      return li
    }),
  )
}

type Testimonial = { quote: string; author: string; note?: string }

export function renderTestimonials(): void {
  const list = document.getElementById('testimonial-list')
  if (!list) return
  const items = tRaw<Testimonial[]>('testimonials.items') ?? []
  list.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li')
      const figure = document.createElement('figure')
      figure.className = 'testimonial'

      const quote = document.createElement('blockquote')
      quote.textContent = item.quote

      const caption = document.createElement('figcaption')
      const author = document.createElement('span')
      author.className = 'testimonial-author'
      author.textContent = item.author
      caption.append(author)

      if (item.note) {
        const note = document.createElement('span')
        note.className = 'testimonial-note'
        note.textContent = item.note
        caption.append(note)
      }

      figure.append(quote, caption)
      li.append(figure)
      return li
    }),
  )
}
