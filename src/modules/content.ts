import worksData from '../data/works.json'
import contactsData from '../data/contacts.json'
import { getLang, t, tRaw, type LangCode } from '../i18n'

type Localized = Partial<Record<LangCode, string>>
type Work = { id: string; image: string; year: string; title: Localized; materials: Localized }
type Contact = { key: string; value: string; href: string }
type Step = { title: string; text: string }

const works = worksData as Work[]
const contacts = contactsData as Contact[]

/** Путь к файлу в public/ с учётом base (важно для GitHub Pages). */
export function asset(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}

function localized(value: Localized): string {
  return value[getLang()] ?? value.en ?? ''
}

export function getWorks(): Work[] {
  return works
}

export function workCaption(work: Work): string {
  const parts = [localized(work.materials), work.year].filter(Boolean)
  return parts.join(' · ')
}

export function renderGallery(onOpen: (index: number) => void): void {
  const grid = document.getElementById('gallery-grid')!
  grid.replaceChildren(
    ...works.map((work, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'work'
      button.setAttribute('aria-label', `${localized(work.title)} — ${t('gallery.open')}`)

      const frame = document.createElement('div')
      frame.className = 'work-frame'
      const img = document.createElement('img')
      img.src = asset(work.image)
      img.alt = localized(work.title)
      img.loading = 'lazy'
      img.decoding = 'async'
      frame.append(img)

      const title = document.createElement('span')
      title.className = 'work-title'
      title.textContent = localized(work.title)

      const meta = document.createElement('span')
      meta.className = 'work-meta'
      meta.textContent = workCaption(work)

      button.append(frame, title, meta)
      button.addEventListener('click', () => onOpen(index))
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
