/* Alvacea — shared behaviour */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Sticky header on scroll */
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile nav */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });

    nav.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Scroll reveal */
  const targets = document.querySelectorAll('.reveal');
  if (targets.length) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      targets.forEach((el) => io.observe(el));
    }
  }

  /* Newsletter (demo) */
  const newsletter = document.getElementById('newsletterForm');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input');
      const button = newsletter.querySelector('button');
      if (!input.value.trim()) return;
      button.textContent = 'Terikirim ✓';
      input.value = '';
      input.placeholder = 'Terima kasih, kamu terdaftar!';
      setTimeout(() => { button.textContent = 'Kirim'; }, 2600);
    });
  }
  /* FAQ accordion */
  const faq = document.getElementById('faqList');
  if (faq) {
    faq.addEventListener('click', (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;

      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('is-open');

      faq.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('is-open');
        const b = i.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  }
})();
