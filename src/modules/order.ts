import { contactEmail } from './content'
import { t } from '../i18n'

/**
 * Заказ с сайта. Своего сервера у статического сайта нет. Как только появится
 * ключ приёмника форм, он вписывается сюда — и заявка уходит на почту сама.
 * Пока ключа нет, сайт собирает письмо и отдаёт его почтовой программе, а
 * рядом кладёт ту же заявку в буфер обмена: её можно вставить куда угодно.
 */
const ENDPOINT = '' // например: https://api.web3forms.com/submit

type Order = { name: string; contact: string; work: string; message: string }

const letterBody = (o: Order): string =>
  [
    `${t('order.name')}: ${o.name}`,
    `${t('order.contact')}: ${o.contact}`,
    o.work ? `${t('order.work')}: ${o.work}` : '',
    o.message ? `\n${o.message}` : '',
  ].filter(Boolean).join('\n')

export function initOrder(): void {
  const form = document.getElementById('order-form') as HTMLFormElement | null
  if (!form) return
  const note = document.getElementById('order-note')!
  const copy = document.getElementById('order-copy') as HTMLButtonElement
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement
  let lastLetter = ''

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lastLetter)
      copy.textContent = t('order.copied')
    } catch {
      copy.textContent = t('order.copyFailed')
    }
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const field = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement
    const order: Order = {
      name: field('order-name').value.trim(),
      contact: field('order-contact').value.trim(),
      work: field('order-work').value.trim(),
      message: field('order-message').value.trim(),
    }

    if (!order.name || !order.contact) {
      note.textContent = t('order.required')
      note.classList.add('is-warning')
      ;(document.getElementById(order.name ? 'order-contact' : 'order-name') as HTMLInputElement).focus()
      return
    }

    const subject = order.work ? `${t('order.title')}: ${order.work}` : t('order.title')
    note.classList.remove('is-warning')

    if (ENDPOINT) {
      note.textContent = t('order.sending')
      button.disabled = true
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ subject, ...order }),
        })
        if (!response.ok) throw new Error(String(response.status))
        note.textContent = t('order.sent')
        form.reset()
        copy.hidden = true
        return
      } catch {
        // ниже — обычный путь через почтовую программу
      } finally {
        button.disabled = false
      }
    }

    lastLetter = `${subject}\n\n${letterBody(order)}`
    note.textContent = t('order.mail')
    copy.hidden = false
    copy.textContent = t('order.copy')
    const letter = document.createElement('a')
    letter.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letterBody(order))}`
    letter.rel = 'noopener'
    letter.click()
  })
}

/** Кнопка в карточке работы ведёт сюда: название уже подставлено. */
export function startOrder(workTitle: string): void {
  const form = document.getElementById('order-form')
  const work = document.getElementById('order-work') as HTMLInputElement | null
  if (!form || !work) return
  work.value = workTitle
  form.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
  const name = document.getElementById('order-name') as HTMLInputElement
  window.setTimeout(() => name.focus({ preventScroll: true }), 120)
}
