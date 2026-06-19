(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let active = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("active", itemIndex === active);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("active", itemIndex === active);
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(active - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(active + 1);
      startHero();
    });
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));
  filterForms.forEach(function (form) {
    const keyword = form.querySelector("[data-filter-keyword]");
    const year = form.querySelector("[data-filter-year]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty-state]");

    function applyFilter() {
      const textValue = keyword ? keyword.value.trim().toLowerCase() : "";
      const yearValue = year ? year.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const searchText = (card.getAttribute("data-search") || "").toLowerCase();
        const cardYear = card.getAttribute("data-year") || "";
        const textMatch = !textValue || searchText.indexOf(textValue) >= 0;
        const yearMatch = !yearValue || cardYear === yearValue;
        const matched = textMatch && yearMatch;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (keyword) {
      keyword.addEventListener("input", applyFilter);
    }

    if (year) {
      year.addEventListener("change", applyFilter);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });
  });
})();
