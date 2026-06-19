(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var keyword = page.querySelector('[data-filter-keyword]');
    var category = page.querySelector('[data-filter-category]');
    var year = page.querySelector('[data-filter-year]');
    var type = page.querySelector('[data-filter-type]');
    var reset = page.querySelector('[data-filter-reset]');
    var cards = selectAll('[data-card]', page);
    var empty = page.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var c = normalize(category && category.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (q && cardText(card).indexOf(q) === -1) {
          ok = false;
        }
        if (c && normalize(card.getAttribute('data-category')) !== c) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')) !== t) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [keyword, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (category) {
          category.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video || !trigger) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function playVideo() {
      if (!source) {
        return;
      }
      trigger.classList.add('hidden');
      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.dataset.ready = 'native';
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.dataset.ready = 'hls';
        } else {
          video.src = source;
          video.dataset.ready = 'direct';
        }
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    trigger.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (!video.dataset.ready) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      trigger.classList.add('hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
