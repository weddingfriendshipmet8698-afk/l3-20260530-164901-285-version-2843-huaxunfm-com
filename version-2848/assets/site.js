const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const $ = (selector, scope = document) => scope.querySelector(selector);

function getRoot() {
  return document.body.dataset.root || './';
}

function initMobileNav() {
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHeaderSearch() {
  $$('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input?.focus();
      }
    });
  });
}

function initImageFallbacks() {
  $$('[data-fallback-image]').forEach((image) => {
    image.addEventListener('error', () => {
      const poster = image.closest('.poster');
      if (poster) {
        poster.classList.add('is-missing');
      }
      image.remove();
    }, { once: true });
  });
}

function initHeroCarousel() {
  const carousel = $('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  const slides = $$('[data-hero-slide]', carousel);
  const dots = $$('[data-hero-dot]', carousel);
  const prev = $('[data-hero-prev]', carousel);
  const next = $('[data-hero-next]', carousel);
  let active = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };

  const schedule = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  prev?.addEventListener('click', () => {
    show(active - 1);
    schedule();
  });

  next?.addEventListener('click', () => {
    show(active + 1);
    schedule();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      schedule();
    });
  });

  carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
  carousel.addEventListener('mouseleave', schedule);
  show(0);
  schedule();
}

function initFilters() {
  $$('[data-filter-panel]').forEach((panel) => {
    const scope = panel.parentElement || document;
    const cards = $$('[data-filter-results] .movie-card', scope);
    const keyword = $('[data-filter-keyword]', panel);
    const region = $('[data-filter-region]', panel);
    const type = $('[data-filter-type]', panel);
    const year = $('[data-filter-year]', panel);
    const empty = $('[data-empty-state]', scope);

    const apply = () => {
      const q = (keyword?.value || '').trim().toLowerCase();
      const regionValue = region?.value || '';
      const typeValue = type?.value || '';
      const yearValue = year?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = (card.dataset.title || '').toLowerCase();
        const matched = (!q || haystack.includes(q))
          && (!regionValue || card.dataset.region === regionValue)
          && (!typeValue || card.dataset.type === typeValue)
          && (!yearValue || card.dataset.year === yearValue);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [keyword, region, type, year].forEach((control) => {
      control?.addEventListener('input', apply);
      control?.addEventListener('change', apply);
    });
  });
}

function movieCardHtml(movie, root) {
  const href = `${root}video/${movie.id}.html`;
  const image = `${root}${movie.coverIndex}.jpg`;
  const safe = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char]));

  return `
    <article class="movie-card">
      <a href="${href}" class="movie-card__link" aria-label="观看 ${safe(movie.title)}">
        <div class="poster" data-title="${safe(movie.title)}">
          <img src="${image}" alt="${safe(movie.title)}" loading="lazy" data-fallback-image>
          <span class="poster__shade"></span>
          <span class="movie-card__region">${safe(movie.region)}</span>
          <span class="movie-card__year">${safe(movie.year)}</span>
          <span class="play-mark" aria-hidden="true">▶</span>
        </div>
        <div class="movie-card__body">
          <h3>${safe(movie.title)}</h3>
          <p>${safe(movie.oneLine)}</p>
          <div class="movie-card__meta">
            <span>${safe(movie.type)}</span>
            <span>热度 ${safe(movie.hot)}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function initSearchPage() {
  const page = $('[data-search-page]');
  if (!page || !window.MOVIE_INDEX) {
    return;
  }

  const root = getRoot();
  const form = $('[data-search-large]', page);
  const input = form?.querySelector('input[name="q"]');
  const summary = $('[data-search-summary]', page);
  const results = $('[data-search-results]', page);
  const params = new URLSearchParams(window.location.search);

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  const render = () => {
    const query = (input?.value || '').trim().toLowerCase();
    if (!query) {
      if (summary) {
        summary.textContent = '请输入关键词开始搜索。';
      }
      if (results) {
        results.innerHTML = '';
      }
      return;
    }

    const matches = window.MOVIE_INDEX.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genreRaw,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    }).slice(0, 80);

    if (summary) {
      summary.textContent = `找到 ${matches.length} 条匹配结果${matches.length === 80 ? '，已显示前 80 条' : ''}。`;
    }
    if (results) {
      results.innerHTML = matches.map((movie) => movieCardHtml(movie, root)).join('');
      initImageFallbacks();
    }
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('q', input?.value || '');
    window.history.replaceState({}, '', nextUrl);
    render();
  });

  input?.addEventListener('input', render);
  render();
}

async function attachHls(video, src) {
  if (video.dataset.hlsReady === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.dataset.hlsReady = 'true';
    return;
  }

  const module = await import('./hls-vendor-dru42stk.js');
  const Hls = module.H;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    window.__movieSiteHls = window.__movieSiteHls || [];
    window.__movieSiteHls.push(hls);
    video.dataset.hlsReady = 'true';
    return;
  }

  video.src = src;
  video.dataset.hlsReady = 'true';
}

function initPlayers() {
  $$('[data-player]').forEach((player) => {
    const video = $('video', player);
    const button = $('[data-player-play]', player);
    const message = $('[data-player-message]', player);
    const src = player.dataset.src;

    if (!video || !src) {
      return;
    }

    video.controls = true;

    const play = async () => {
      try {
        if (message) {
          message.textContent = '正在加载播放源…';
        }
        await attachHls(video, src);
        player.classList.add('is-ready');
        await video.play();
        player.classList.add('is-playing');
        if (message) {
          message.textContent = '播放源已加载。';
        }
      } catch (error) {
        player.classList.remove('is-playing');
        if (message) {
          message.textContent = '播放源加载失败，请检查网络环境后重试。';
        }
        console.error('Video playback failed:', error);
      }
    };

    button?.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
  });
}

initMobileNav();
initHeaderSearch();
initImageFallbacks();
initHeroCarousel();
initFilters();
initSearchPage();
initPlayers();
