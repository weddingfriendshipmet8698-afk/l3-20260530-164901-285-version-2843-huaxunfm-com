
import { H as Hls } from './hls-vendor-dru42stk.js';

const DATA = window.MOVIE_DATA || [];

function hashCode(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function svgDataUri(svg) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function makePoster(title, subtitle, seed) {
  const h = hashCode(seed + title);
  const hue1 = h % 360;
  const hue2 = (hue1 + 38) % 360;
  const hue3 = (hue1 + 170) % 360;
  const safeTitle = String(title || '').slice(0, 12);
  const safeSub = String(subtitle || '').slice(0, 20);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1280" viewBox="0 0 900 1280">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue1} 76% 52%)"/>
        <stop offset="55%" stop-color="hsl(${hue2} 72% 42%)"/>
        <stop offset="100%" stop-color="hsl(${hue3} 68% 28%)"/>
      </linearGradient>
      <radialGradient id="r" cx="50%" cy="25%" r="80%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity=".35"/>
      </filter>
    </defs>
    <rect width="900" height="1280" rx="48" fill="url(#g)"/>
    <rect width="900" height="1280" rx="48" fill="url(#r)"/>
    <rect x="52" y="52" width="796" height="1176" rx="40" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
    <g filter="url(#shadow)">
      <rect x="90" y="98" width="280" height="62" rx="31" fill="rgba(255,255,255,.16)"/>
      <text x="230" y="138" text-anchor="middle" fill="#fff" font-size="28" font-family="PingFang SC,Microsoft YaHei,sans-serif">{safeSub}</text>
    </g>
    <text x="90" y="410" fill="#fff" font-size="92" font-weight="700" font-family="PingFang SC,Microsoft YaHei,sans-serif">{safeTitle}</text>
    <text x="90" y="510" fill="rgba(255,255,255,.84)" font-size="34" font-family="PingFang SC,Microsoft YaHei,sans-serif">{String(title || '').slice(0, 28)}</text>
    <path d="M110 1060 C250 880, 370 1020, 510 820 S770 720, 820 580" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="710" cy="210" r="130" fill="rgba(255,255,255,.13)"/>
    <circle cx="200" cy="1040" r="210" fill="rgba(0,0,0,.18)"/>
    <text x="90" y="1206" fill="rgba(255,255,255,.68)" font-size="26" font-family="PingFang SC,Microsoft YaHei,sans-serif">点击观看 · 静态页面可直接访问</text>
  </svg>`;
  return svgDataUri(svg);
}

function createCard(movie, compact = false) {
  const a = document.createElement('a');
  a.className = `movie-card${compact ? ' small' : ''}`;
  a.href = `movies/${movie.id}.html`;
  a.innerHTML = `
    <div class="poster-wrap">
      <img class="poster" alt="${escapeHtml(movie.title)}" loading="lazy" src="${makePoster(movie.title, movie.region + ' · ' + movie.year, movie.id)}" />
      <span class="poster-badge">${escapeHtml(movie.category_name || movie.genre || '推荐')}</span>
    </div>
    <div class="card-body">
      <div class="card-topline"><strong>${escapeHtml(movie.title)}</strong><span>${movie.year || ''}</span></div>
      <p>${escapeHtml(movie.one_line || movie.summary || '')}</p>
      <div class="chips">
        <span>${escapeHtml(movie.region || '')}</span>
        <span>${escapeHtml(movie.type || '')}</span>
        <span>${escapeHtml(movie.genre || '')}</span>
      </div>
    </div>`;
  return a;
}

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function initMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-menu]');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => panel.classList.toggle('open'));
}

function initHeroCarousel() {
  const root = document.querySelector('[data-hero-carousel]');
  if (!root) return;
  const slides = [...root.querySelectorAll('.hero-slide')];
  const indicators = [...root.querySelectorAll('[data-indicator]')];
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  if (!slides.length) return;
  let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  if (index < 0) index = 0;
  let timer = null;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === index));
    indicators.forEach((dot, n) => dot.classList.toggle('is-active', n === index));
  }
  function play() {
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5200);
  }
  prev && prev.addEventListener('click', () => { show(index - 1); play(); });
  next && next.addEventListener('click', () => { show(index + 1); play(); });
  indicators.forEach((dot, n) => dot.addEventListener('click', () => { show(n); play(); }));
  show(index);
  play();
}

function renderMovieGrid(list, mount, compact = false) {
  if (!mount) return;
  mount.innerHTML = '';
  list.forEach(movie => mount.appendChild(createCard(movie, compact)));
}

function scoreText(movie) {
  const h = hashCode(movie.title + movie.region + movie.genre);
  return (60 + (h % 40)).toString();
}

function initSearchPage() {
  const input = document.querySelector('[data-search-input]');
  const mount = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');
  if (!input || !mount) return;

  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  input.value = q;

  function apply() {
    const kw = input.value.trim().toLowerCase();
    const results = DATA.filter(movie => {
      if (!kw) return true;
      const hay = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.one_line, movie.summary, movie.review, movie.year].join(' ').toLowerCase();
      return hay.includes(kw);
    }).sort((a, b) => (b.hot || 0) - (a.hot || 0));
    mount.innerHTML = '';
    results.slice(0, 120).forEach(movie => mount.appendChild(createCard(movie, true)));
    if (count) count.textContent = `${results.length} 条结果`;
  }

  input.addEventListener('input', apply);
  apply();
}

function initPlayer() {
  const players = [...document.querySelectorAll('[data-player]')];
  players.forEach(player => {
    const video = player.querySelector('video');
    if (!video) return;
    const m3u8 = video.dataset.m3u8;
    const mp4 = video.dataset.mp4;
    const poster = video.getAttribute('poster') || '';

    function loadFallback() {
      if (mp4) video.src = mp4;
    }

    if (m3u8 && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(m3u8);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          loadFallback();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && m3u8) {
      video.src = m3u8;
    } else {
      loadFallback();
    }

    const playBtn = player.querySelector('[data-play]');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        video.play().catch(() => {});
        player.classList.add('is-playing');
      });
    }
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
  });
}

window.MovieSite = {
  makePoster,
  createCard,
  renderMovieGrid,
};

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHeroCarousel();
  initSearchPage();
  initPlayer();
});
