(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var catalogs = Array.prototype.slice.call(document.querySelectorAll('[data-catalog]'));
  catalogs.forEach(function (catalog) {
    var form = catalog.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card]'));
    var empty = catalog.querySelector('[data-empty-state]');
    if (!form || !cards.length) {
      return;
    }
    var keywordInput = form.querySelector('[data-filter-keyword]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var categorySelect = form.querySelector('[data-filter-category]');
    var params = new URLSearchParams(window.location.search);
    var keywordParam = params.get('keyword');
    if (keywordParam && keywordInput) {
      keywordInput.value = keywordParam;
    }
    var apply = function () {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var category = categorySelect && categorySelect.value || '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-keywords')
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', function () {
      window.setTimeout(apply, 0);
    });
    apply();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;
    var loadVideo = function () {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hlsInstance = new globalThis.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('controls', 'controls');
    };
    var startVideo = function () {
      loadVideo();
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    };
    button.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });

  var scrollButtons = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
  scrollButtons.forEach(function (item) {
    item.addEventListener('click', function () {
      var player = document.querySelector('[data-player]');
      if (player) {
        window.setTimeout(function () {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 30);
      }
    });
  });
})();
