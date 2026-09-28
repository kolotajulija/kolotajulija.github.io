import { contactEmail } from './content'
import { t } from '../i18n'

/**
 * Заказ прямо с сайта. Сайт статический, своего сервера у него нет, поэтому
 * форма собирает письмо и отдаёт его почтовой программе человека: заказ
 * приходит с его собственного адреса, и отвечать можно сразу в переписке.
 */
export function initOrder(): void {
  const form = document.getElementById('order-form') as HTMLFormElement | null
  if (!form) return
  const note = document.getElementById('order-note')!

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const value = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement).value.trim()
    const name = value('order-name')
    const contact = value('order-contact')
    const work = value('order-work')
    const message = value('order-message')

    if (!name || !contact) {
      note.textContent = t('order.required')
      note.classList.add('is-warning')
      ;(document.getElementById(name ? 'order-contact' : 'order-name') as HTMLInputElement).focus()
      return
    }

    const subject = work ? `${t('order.title')}: ${work}` : t('order.title')
    const body = [
      `${t('order.name')}: ${name}`,
      `${t('order.contact')}: ${contact}`,
      work ? `${t('order.work')}: ${work}` : '',
      message ? `\n${message}` : '',
    ].filter(Boolean).join('\n')

    note.classList.remove('is-warning')
    note.textContent = t('order.sent')
    const letter = document.createElement('a')
    letter.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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
