import worksData from '../data/works.json'
import contactsData from '../data/contacts.json'
import { getLang, t, tRaw, type LangCode } from '../i18n'
import { updateUrl } from './url'

type Localized = Partial<Record<LangCode, string>>
type WorkImage = { small: string; large: string }
/** Раздел галереи: работы с натуральными камнями, искусство, ювелирные изделия. */
type Group = 'stones' | 'art' | 'jewellery'
type Work = {
  id: string
  group: Group | Group[]
  status: 'available' | 'sold' | 'order'
  lead?: Localized
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

/** Порядок разделов в галерее; внутри раздела работы идут как в works.json. */
const GROUPS: Group[] = ['stones', 'art', 'jewellery']

/** Работа может числиться в нескольких разделах сразу. */
const groupsOf = (work: Work): Group[] => (Array.isArray(work.group) ? work.group : [work.group])

// лента лайтбокса идёт в том же порядке, что и карточки: работы стоят по
// своему первому разделу, каждая по одному разу
const works = [...(worksData as Work[])].sort(
  (a, b) => GROUPS.indexOf(groupsOf(a)[0]) - GROUPS.indexOf(groupsOf(b)[0]),
)
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
export const workStatus = (w: Work) => t(`gallery.${w.status}`)
export const workLead = (w: Work) => (w.lead ? localized(w.lead) : '')

/** Все снимки всех работ одной лентой — по ней и ходят стрелки лайтбокса. */
export function getSlides(): Slide[] {
  return works.flatMap((work) =>
    work.images.map((image, i) => ({ work, image, position: i + 1, total: work.images.length })),
  )
}

export function renderGallery(onOpen: (slideIndex: number) => void): void {
  let slideIndex = 0

  const card = (work: Work): HTMLButtonElement => {
      const firstSlide = slideIndex
      slideIndex += work.images.length

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'work'
      button.dataset.groups = groupsOf(work).join(' ')
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
  }

  const grid = document.getElementById('gallery-grid')!
  grid.replaceChildren(...works.map(card))

  // фильтр: по умолчанию видно всё, кнопка оставляет один раздел
  const filters = document.getElementById('gallery-filters')
  const current = new URLSearchParams(window.location.search).get('group')
  const active = GROUPS.includes(current as Group) ? (current as Group) : null

  const apply = (group: Group | null) => {
    grid.querySelectorAll<HTMLElement>('.work').forEach((el) => {
      el.hidden = group !== null && !(el.dataset.groups ?? '').split(' ').includes(group)
    })
    filters?.querySelectorAll<HTMLButtonElement>('.gallery-filter').forEach((b) => {
      const on = (b.dataset.group ?? '') === (group ?? '')
      b.classList.toggle('is-active', on)
      b.setAttribute('aria-pressed', String(on))
    })
    updateUrl({ group })
  }

  if (filters) {
    const buttons: Array<{ group: Group | null; label: string }> = [
      { group: null, label: t('gallery.groups.all') },
      ...GROUPS.map((group) => ({ group, label: t(`gallery.groups.${group}`) })),
    ]
    filters.replaceChildren(
      ...buttons.map(({ group, label }) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'gallery-filter'
        button.dataset.group = group ?? ''
        button.textContent = label
        button.addEventListener('click', () => apply(group))
        return button
      }),
    )
  }

  apply(active)
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

type Testimonial = { quote: string; author: string; note?: string; photo?: { small: string; large: string; alt?: string } }

export function renderTestimonials(): void {
  const list = document.getElementById('testimonial-list')
  if (!list) return
  const items = tRaw<Testimonial[]>('testimonials.items') ?? []
  list.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li')
      const figure = document.createElement('figure')
      figure.className = 'testimonial'

      if (item.photo) {
        figure.classList.add('has-photo')
        const img = document.createElement('img')
        img.className = 'testimonial-photo'
        img.src = asset(item.photo.small)
        img.srcset = `${asset(item.photo.small)} 800w, ${asset(item.photo.large)} 1600w`
        img.sizes = '(max-width: 700px) 100vw, 13rem'
        img.alt = item.photo.alt ?? item.author
        img.loading = 'lazy'
        img.decoding = 'async'
        figure.append(img)
      }

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
