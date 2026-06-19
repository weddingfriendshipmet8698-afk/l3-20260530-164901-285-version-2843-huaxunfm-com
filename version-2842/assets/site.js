(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;

  function showSlide(nextIndex) {
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

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var genreSelect = filterRoot.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var matchesQuery = !query || title.indexOf(query) !== -1 || normalize(cardGenre).indexOf(query) !== -1;
        var matchesYear = !year || cardYear === year;
        var matchesType = !type || cardType.indexOf(type) !== -1;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
        card.classList.toggle('hidden-card', !(matchesQuery && matchesYear && matchesType && matchesGenre));
      });
    }

    [searchInput, yearSelect, typeSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var nativePlayers = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  nativePlayers.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    var source = wrap.getAttribute('data-src');

    if (!video || !button || !source) {
      return;
    }

    function nativeStart() {
      if (wrap.getAttribute('data-hls-ready') === 'true') {
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }

      var playPromise = video.play();
      button.classList.add('hidden');

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('hidden');
        });
      }
    }

    button.addEventListener('click', nativeStart);
    video.addEventListener('click', function () {
      if (video.paused) {
        nativeStart();
      }
    });
  });
})();
