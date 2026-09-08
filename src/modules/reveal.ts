/** Мягкое появление блоков при прокрутке. */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('.section-head, .work, .about-media, .about-text, .process-list li, .contact-list li')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        obs.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -10% 0px' },
  )

  targets.forEach((el, i) => {
    el.classList.add('reveal')
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`
    observer.observe(el)
  })
}
