(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5800);
      });
    });

    show(0);
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5800);
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var scope = input.closest("[data-search-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var noResults = scope.querySelector("[data-no-results]");

      function filter() {
        var value = input.value.trim().toLowerCase();
        var typeSelect = scope.querySelector("[data-type-filter]");
        var typeValue = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-search") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchesText = !value || haystack.indexOf(value) !== -1;
          var matchesType = !typeValue || cardType === typeValue;
          var matches = matchesText && matchesType;
          card.style.display = matches ? "" : "none";
          if (matches) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", filter);
      var select = scope.querySelector("[data-type-filter]");
      if (select) {
        select.addEventListener("change", filter);
      }
      filter();
    });
  }

  window.initMoviePlayer = function (selector, videoUrl) {
    var root = document.querySelector(selector);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector("[data-play-button]");
    var layer = root.querySelector(".play-layer");
    var started = false;

    function attach() {
      if (started || !video) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function begin() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
