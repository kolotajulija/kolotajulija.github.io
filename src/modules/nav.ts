/** Мобильное меню, подсветка активного раздела, тень у шапки при прокрутке. */
export function initNav(): void {
  const header = document.getElementById('site-header')!
  const nav = document.getElementById('site-nav')!
  const toggle = document.getElementById('nav-toggle')!
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))

  const closeMenu = () => {
    nav.classList.remove('is-open')
    toggle.setAttribute('aria-expanded', 'false')
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', String(open))
  })
  links.forEach((link) => link.addEventListener('click', closeMenu))
  window.addEventListener('resize', closeMenu)

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((el): el is HTMLElement => Boolean(el))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`))
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  sections.forEach((section) => observer.observe(section))
}
