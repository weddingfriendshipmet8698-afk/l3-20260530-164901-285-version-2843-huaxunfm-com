
(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  function initSearchableGrids() {
    document.querySelectorAll('[data-filter-root]').forEach((root) => {
      const input = root.querySelector('[data-filter-input]');
      const year = root.querySelector('[data-filter-year]');
      const region = root.querySelector('[data-filter-region]');
      const sort = root.querySelector('[data-sort-select]');
      const grid = root.querySelector('[data-filter-grid]');
      const empty = root.querySelector('[data-filter-empty]');
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('[data-searchable]'));
      const baseOrder = cards.slice();

      function apply() {
        const q = (input?.value || '').trim().toLowerCase();
        const y = (year?.value || '').trim();
        const r = (region?.value || '').trim();
        const s = sort?.value || 'latest';
        let list = baseOrder.slice();

        list.forEach((card) => {
          const text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type].join(' ').toLowerCase();
          const okQ = !q || text.includes(q);
          const okY = !y || card.dataset.year === y;
          const okR = !r || card.dataset.region === r;
          card.style.display = okQ && okY && okR ? '' : 'none';
        });

        const visible = list.filter((card) => card.style.display !== 'none');
        if (s === 'title') {
          visible.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN'));
        } else if (s === 'year-asc') {
          visible.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
        } else if (s === 'year-desc') {
          visible.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        } else {
          visible.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        }
        visible.forEach((card) => grid.appendChild(card));
        if (empty) empty.style.display = visible.length ? 'none' : 'block';
      }

      [input, year, region, sort].forEach((el) => el && el.addEventListener('input', apply));
      [year, region, sort].forEach((el) => el && el.addEventListener('change', apply));
      apply();
    });
  }

  function initHeroCarousel() {
    const hero = document.querySelector('[data-hero-carousel]');
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    if (slides.length <= 1) return;
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    }
    function start() { timer = window.setInterval(() => show(index + 1), 6000); }
    function restart() { if (timer) window.clearInterval(timer); start(); }
    prev && prev.addEventListener('click', () => { show(index - 1); restart(); });
    next && next.addEventListener('click', () => { show(index + 1); restart(); });
    hero.addEventListener('mouseenter', () => timer && window.clearInterval(timer));
    hero.addEventListener('mouseleave', () => { if (!timer) start(); });
    show(0);
    start();
  }

  function initPlayer() {
    document.querySelectorAll('[data-player]').forEach((shell) => {
      const video = shell.querySelector('video');
      const playBtn = shell.querySelector('[data-play-btn]');
      const hlsSrc = shell.dataset.hlsSrc || '';
      const mp4Src = shell.dataset.mp4Src || '';
      let hls = null;

      function load() {
        if (!video) return;
        const supportsHls = window.Hls && window.Hls.isSupported();
        if (supportsHls && hlsSrc) {
          if (hls) {
            try { hls.destroy(); } catch (e) {}
          }
          hls = new Hls();
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          });
        } else {
          video.src = mp4Src || hlsSrc;
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        }
      }

      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.preventDefault();
          load();
        });
      }
    });
  }

  initSearchableGrids();
  initHeroCarousel();
  initPlayer();
})();
