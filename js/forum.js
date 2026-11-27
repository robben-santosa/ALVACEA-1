/* Alvacea — forum diskusi & co-creation */

(function () {
  'use strict';

  const list = document.getElementById('threadList');
  const empty = document.getElementById('emptyState');
  const countEl = document.getElementById('threadCount');
  const chips = document.getElementById('filterChips');

  const CATEGORY_META = {
    review: { label: 'Review',           cls: 'tag--sky'   },
    tips:   { label: 'Tips & Hemat',     cls: 'tag--green' },
    ide:    { label: 'Ide Produk',       cls: 'tag--honey' },
    tanya:  { label: 'Tanya Jawab',      cls: 'tag--stone' }
  };

  const AVATAR_TINTS = ['#D5E3E8', '#E4E3BC', '#E0DCD1', '#D5E3BC'];

  let activeFilter = 'semua';

  function updateCount() {
    const visible = list.querySelectorAll('.thread:not([hidden])').length;
    if (countEl) countEl.textContent = `${visible} topik`;
    if (empty) empty.hidden = visible !== 0;
  }

  function applyFilter(filter) {
    activeFilter = filter;

    list.querySelectorAll('.thread').forEach((t) => {
      t.hidden = filter !== 'semua' && t.dataset.category !== filter;
    });

    if (chips) {
      chips.querySelectorAll('.chip').forEach((c) => {
        c.classList.toggle('is-active', c.dataset.filter === filter);
      });
    }

    updateCount();
  }

  /* ---------- filter chips ---------- */

  if (chips) {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) applyFilter(chip.dataset.filter);
    });
  }

  /* ---------- jump dari sidebar ---------- */

  document.querySelectorAll('[data-jump]').forEach((link) => {
    link.addEventListener('click', () => applyFilter(link.dataset.jump));
  });

  /* ---------- composer ---------- */

  const form = document.getElementById('composerForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('topicTitle');
      const body = document.getElementById('topicBody');
      const cat = document.getElementById('topicCategory');

      const cleanTitle = title.value.trim();
      const cleanBody = body.value.trim();
      if (!cleanTitle || !cleanBody) return;

      const category = cat.value;
      const meta = CATEGORY_META[category];
      const tint = AVATAR_TINTS[Math.floor(Math.random() * AVATAR_TINTS.length)];

      const article = document.createElement('article');
      article.className = 'thread';
      article.dataset.category = category;

      article.innerHTML = `
        <span class="thread-avatar" style="--av:${tint}">KM</span>
        <div class="thread-main">
          <div class="thread-meta">
            <span class="tag ${meta.cls}">${meta.label}</span>
            <span>Kamu</span>
            <span>·</span>
            <span>baru saja</span>
          </div>
          <h3></h3>
          <p class="thread-excerpt"></p>
          <div class="thread-stats">
            <span>
              <svg viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
              0 balasan
            </span>
            <span class="is-liked">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>
              0
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7"/></svg>
              0
            </span>
          </div>
        </div>
        <span class="thread-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

      article.querySelector('h3').textContent = cleanTitle;
      article.querySelector('.thread-excerpt').textContent = cleanBody;

      list.prepend(article);

      form.reset();
      applyFilter('semua');

      article.scrollIntoView({ behavior: 'smooth', block: 'center' });
      article.animate(
        [
          { backgroundColor: 'rgba(228, 227, 188, .55)', transform: 'translateY(-6px)' },
          { backgroundColor: 'transparent', transform: 'translateY(0)' }
        ],
        { duration: 1100, easing: 'ease-out' }
      );
    });
  }

  updateCount();
})();
