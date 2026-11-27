/* Alvacea — halaman kustomisasi produk */

(function () {
  'use strict';

  const BASE_PRICE = 49000;
  const rp = (n) => 'Rp' + n.toLocaleString('id-ID');

  const state = {
    basis:   { label: 'Tawas Murni',            price: 0 },
    ekstrak: [{ label: 'Aloe Vera', price: 5000 }],
    aroma:   { label: 'Mint Segar',             price: 4000 },
    botol:   { label: 'Botol 100 ml',           price: 0 },
    scent:   3
  };

  const SCENT_LABELS = { 1: 'Sangat Ringan', 2: 'Ringan', 3: 'Sedang', 4: 'Kuat', 5: 'Sangat Kuat' };

  /* grup yang sudah disentuh pengguna (untuk rail langkah) */
  const touched = new Set();
  const GROUP_ORDER = ['basis', 'ekstrak', 'aroma', 'botol'];

  /* ekstrak terakhir dipilih — menentukan warna preview */
  let lastEkstrak = 'Aloe Vera';

  /* ---------- selection handling ---------- */

  function readOption(btn) {
    return {
      label: btn.dataset.value,
      price: Number(btn.dataset.price || 0),
      none: btn.dataset.none === 'true'
    };
  }

  document.querySelectorAll('[data-group]').forEach((grid) => {
    const group = grid.dataset.group;
    const mode = grid.dataset.mode; // 'single' | 'multi'

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.option');
      if (!btn) return;

      touched.add(group);
      if (group === 'ekstrak') {
        lastEkstrak = btn.dataset.none === 'true' ? '' : btn.dataset.value;
      }

      if (mode === 'single') {
        grid.querySelectorAll('.option').forEach((o) => o.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        state[group] = readOption(btn);
      } else {
        const opt = readOption(btn);

        if (opt.none) {
          // "Tanpa ekstrak" membatalkan pilihan lain
          grid.querySelectorAll('.option').forEach((o) => o.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          state[group] = [];
        } else {
          const noneBtn = grid.querySelector('[data-none="true"]');
          if (noneBtn) noneBtn.classList.remove('is-selected');

          const already = btn.classList.contains('is-selected');
          const picked = [...grid.querySelectorAll('.option.is-selected')];

          if (already && picked.length === 1) return; // minimal satu pilihan
          btn.classList.toggle('is-selected', !already);

          state[group] = [...grid.querySelectorAll('.option.is-selected')].map(readOption);
        }
      }

      render();
    });
  });

  /* ---------- scent slider ---------- */

  const slider = document.getElementById('scentLevel');
  const scentOut = document.getElementById('scentValue');

  function paintSlider() {
    if (!slider) return;
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--viridian) 0%, var(--viridian) ${pct}%, var(--stone) ${pct}%, var(--stone) 100%)`;
  }

  if (slider) {
    slider.addEventListener('input', () => {
      state.scent = Number(slider.value);
      touched.add('aroma');
      if (scentOut) scentOut.textContent = SCENT_LABELS[state.scent];
      paintSlider();
      render();
    });
    paintSlider();
    if (scentOut) scentOut.textContent = SCENT_LABELS[state.scent];
  }

  /* ---------- summary ---------- */

  const el = (id) => document.getElementById(id);

  function render() {
    const ekstrakLabels = state.ekstrak.length
      ? state.ekstrak.map((e) => e.label).join(', ')
      : 'Tanpa ekstrak';

    if (el('sumBasis'))   el('sumBasis').textContent   = state.basis.label;
    if (el('sumEkstrak')) el('sumEkstrak').textContent = ekstrakLabels;
    if (el('sumAroma'))   el('sumAroma').textContent   = `${state.aroma.label} · ${SCENT_LABELS[state.scent]}`;
    if (el('sumBotol'))   el('sumBotol').textContent   = state.botol.label;

    /* nama singkat untuk kartu produk */
    const flavor = el('summaryFlavor');
    if (flavor) {
      const parts = [];
      if (state.ekstrak.length && state.ekstrak[0].label !== 'Tanpa Ekstrak') {
        parts.push(state.ekstrak.slice(0, 2).map((e) => e.label).join(' & '));
      }
      if (state.aroma.label !== 'Tanpa Aroma') parts.push(state.aroma.label);
      flavor.textContent = parts.length ? parts.join(' · ') : 'Formula Polos';
    }

    /* warna latar preview mengikuti ekstrak terpilih */
    const preview = document.querySelector('.summary-preview');
    if (preview) {
      const first = state.ekstrak.length ? lastEkstrak : 'Tanpa Ekstrak';
      const TINT = {
        'Aloe Vera':        ['#CFE2E9', '#E4E3BC'],
        'Daun Mint':        ['#D5E3E8', '#EAF3EF'],
        'Cengkeh':          ['#F3E4D7', '#E9E3D2'],
        'Kemangi':          ['#E4E3BC', '#DCE7DE'],
        'Daun Sirih':       ['#DCE7DE', '#E4E3BC'],
        'Tanpa Ekstrak':    ['#E7E3DA', '#F1EFE8']
      };
      const [a, b] = TINT[first] || ['#CFE2E9', '#E4E3BC'];
      preview.style.setProperty('--tint-a', a);
      preview.style.setProperty('--tint-b', b);
    }

    /* total harga */
    const extras =
      state.basis.price +
      state.aroma.price +
      state.botol.price +
      state.ekstrak.reduce((sum, e) => sum + e.price, 0);

    if (el('sumTotal')) el('sumTotal').textContent = rp(BASE_PRICE + extras);

    /* progres langkah */
    const done = [
      !!state.basis,
      state.ekstrak.length > 0,
      !!state.aroma,
      !!state.botol
    ].filter(Boolean).length;

    if (el('progressFill')) el('progressFill').style.width = `${(done / 4) * 100}%`;
    if (el('progressText')) el('progressText').textContent = `${done}/4 langkah`;

    /* rail langkah */
    const rail = document.getElementById('stepRail');
    if (rail) {
      const firstOpen = GROUP_ORDER.find((g) => !touched.has(g));
      GROUP_ORDER.forEach((g) => {
        const item = rail.querySelector(`[data-rail="${g}"]`);
        if (!item) return;
        item.classList.toggle('is-done', touched.has(g));
        item.classList.toggle('is-current', g === firstOpen);
      });
    }
  }

  render();

  /* ---------- tombol pesan ---------- */

  const orderBtn = document.getElementById('orderBtn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer;

  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const total = rp(
        BASE_PRICE +
        state.basis.price +
        state.aroma.price +
        state.botol.price +
        state.ekstrak.reduce((s, e) => s + e.price, 0)
      );

      if (toastText) {
        toastText.textContent = `Racikan kamu (${total}) masuk keranjang`;
      }
      if (toast) {
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
      }
    });
  }
})();
