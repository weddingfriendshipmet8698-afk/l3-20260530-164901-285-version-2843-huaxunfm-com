
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const body = document.body;

  function getText(el, fallback = "") {
    return (el && el.textContent ? el.textContent : fallback).trim();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildTagRow(tags) {
    if (!tags || !tags.length) return "";
    return `<div class="tag-row">${tags.slice(0, 4).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
  }

  function cardHtml(movie, indexLabel = "") {
    const tags = Array.isArray(movie.tags) ? movie.tags : [];
    const tagsText = tags.join(" ");
    const meta = [
      movie.region || "",
      movie.type || "",
      movie.year || ""
    ].join(" ");
    return `
      <a class="movie-card fade-in"
         href="movie-${movie.id}.html"
         data-title="${escapeHtml(movie.title)}"
         data-search="${escapeHtml([movie.title, movie.region, movie.type, movie.genre, tagsText, movie.oneLine].join(" "))}"
         data-bucket="${escapeHtml(movie.bucket || "")}">
        <div class="movie-thumb">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="movie-badge">${escapeHtml(movie.type || "影片")}</span>
          <span class="movie-year">${escapeHtml(String(movie.year || ""))}</span>
        </div>
        <div class="movie-body">
          <h3>${escapeHtml(movie.title)}</h3>
          <p>${escapeHtml(movie.oneLine || "")}</p>
          <div class="movie-meta">
            <span>${escapeHtml(movie.region || "")}</span>
            <span>${escapeHtml(movie.genre || "")}</span>
          </div>
          ${buildTagRow(tags)}
        </div>
      </a>
    `;
  }

  function initNav() {
    const toggle = qs("[data-nav-toggle]");
    const panel = qs("[data-nav-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
      panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });

    qsa(".site-nav a").forEach(a => {
      a.addEventListener("click", () => {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function initHeroSlider() {
    const hero = qs("[data-hero-slider]");
    if (!hero) return;

    const slides = qsa("[data-hero-slide]", hero);
    const dots = qsa("[data-hero-dot]", hero);
    const prev = qs("[data-hero-prev]", hero);
    const next = qs("[data-hero-next]", hero);

    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle("active", idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle("active", idx === index));
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    prev && prev.addEventListener("click", () => {
      show(index - 1);
      start();
    });

    next && next.addEventListener("click", () => {
      show(index + 1);
      start();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        show(idx);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function applyFilterToCards(container) {
    if (!container) return;
    const input = qs("[data-filter-input]", container);
    const typeSelect = qs("[data-filter-type]", container);
    const yearSelect = qs("[data-filter-year]", container);
    const cards = qsa("[data-filter-card]", container);
    const emptyState = qs("[data-filter-empty]", container);

    function matchCard(card) {
      const search = (card.dataset.search || "").toLowerCase();
      const title = (card.dataset.title || "").toLowerCase();
      const bucket = card.dataset.bucket || "";
      const term = (input?.value || "").trim().toLowerCase();
      const typeFilter = typeSelect?.value || "";
      const yearFilter = yearSelect?.value || "";
      let ok = true;

      if (term) {
        ok = search.includes(term) || title.toLowerCase().includes(term);
      }
      if (ok && typeFilter) {
        ok = (card.dataset.type || "").includes(typeFilter) || search.includes(typeFilter.toLowerCase());
      }
      if (ok && yearFilter) {
        ok = (card.dataset.year || "") === yearFilter;
      }
      return ok;
    }

    function render() {
      let visible = 0;
      cards.forEach(card => {
        const ok = matchCard(card);
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    }

    input && input.addEventListener("input", render);
    typeSelect && typeSelect.addEventListener("change", render);
    yearSelect && yearSelect.addEventListener("change", render);
    render();
  }

  async function initSearchPage() {
    const root = qs("[data-search-page]");
    if (!root) return;

    const input = qs("[data-search-input]", root);
    const typeSelect = qs("[data-search-type]", root);
    const yearSelect = qs("[data-search-year]", root);
    const results = qs("[data-search-results]", root);
    const count = qs("[data-search-count]", root);
    const tip = qs("[data-search-tip]", root);

    if (!results) return;

    let dataset = [];
    try {
      const res = await fetch("data/movies.json", { cache: "force-cache" });
      dataset = await res.json();
    } catch (err) {
      results.innerHTML = '<div class="empty-state">搜索数据加载失败，请稍后重试。</div>';
      return;
    }

    const years = [...new Set(dataset.map(m => String(m.year)))].sort((a, b) => Number(b) - Number(a));
    if (yearSelect && yearSelect.options.length <= 1) {
      years.slice(0, 10).forEach(year => {
        const opt = document.createElement("option");
        opt.value = year;
        opt.textContent = year;
        yearSelect.appendChild(opt);
      });
    }

    const queryParam = new URLSearchParams(location.search).get("q");
    if (queryParam && input) input.value = queryParam;

    function renderList(list) {
      count && (count.textContent = `${list.length} 条结果`);
      results.innerHTML = list.slice(0, 80).map(cardHtml).join("") || '<div class="empty-state">没有找到匹配内容。</div>';
    }

    function filter() {
      const term = (input?.value || "").trim().toLowerCase();
      const typeFilter = typeSelect?.value || "";
      const yearFilter = yearSelect?.value || "";
      let list = dataset.filter(movie => {
        const hay = [
          movie.title, movie.region, movie.type, movie.genre,
          movie.oneLine, movie.review, (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        let ok = !term || hay.includes(term);
        if (ok && typeFilter) ok = (movie.type || "").includes(typeFilter);
        if (ok && yearFilter) ok = String(movie.year) === yearFilter;
        return ok;
      });

      list.sort((a, b) => b.score - a.score);
      renderList(list);
      if (tip) {
        tip.textContent = list.length ? "可继续缩小范围，也可直接点击海报进入详情页。" : "试试换一个关键词。";
      }
    }

    input && input.addEventListener("input", filter);
    typeSelect && typeSelect.addEventListener("change", filter);
    yearSelect && yearSelect.addEventListener("change", filter);
    filter();
  }

  function initDetailPlayer() {
    const video = qs("[data-player]");
    if (!video) return;

    const overlay = qs("[data-player-overlay]");
    const playBtn = qs("[data-player-play]");
    const poster = video.dataset.poster || "";
    const mp4 = video.dataset.mp4 || "";
    const m3u8 = video.dataset.m3u8 || "";
    const preferHls = video.dataset.preferHls === "true";

    let hlsInstance = null;
    function attachSource() {
      if (preferHls && m3u8) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(m3u8);
          hlsInstance.attachMedia(video);
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = m3u8;
          return;
        }
      }
      video.src = mp4 || m3u8;
    }

    attachSource();
    if (poster) video.poster = poster;

    async function startPlay() {
      try {
        overlay && overlay.classList.add("hidden");
        await video.play();
      } catch (err) {
        // user gesture may be required; leave overlay visible if playback fails
        overlay && overlay.classList.remove("hidden");
      }
    }

    playBtn && playBtn.addEventListener("click", startPlay);
    video.addEventListener("play", () => overlay && overlay.classList.add("hidden"));
    video.addEventListener("pause", () => {
      if (video.currentTime <= 0.05) overlay && overlay.classList.remove("hidden");
    });
    video.addEventListener("ended", () => overlay && overlay.classList.remove("hidden"));

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  function initReveal() {
    const items = qsa(".movie-card, .category-card, .panel, .detail-poster, .player-wrap");
    if (!items.length) return;
    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("fade-in");
      });
    }, { threshold: 0.12 }) : null;
    if (io) {
      items.forEach(item => io.observe(item));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initHeroSlider();
    initDetailPlayer();
    initSearchPage();
    qsa("[data-filter-container]").forEach(applyFilterToCards);
    initReveal();
  });
})();
