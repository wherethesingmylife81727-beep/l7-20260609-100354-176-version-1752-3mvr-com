(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var filterList = document.querySelector("[data-filter-list]");

    function applyFilter() {
      if (!filterList) {
        return;
      }
      var query = normalize(filterInput ? filterInput.value : "");
      var year = yearFilter ? yearFilter.value : "";
      filterList.querySelectorAll(".movie-card-item").forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var cardYear = String(card.getAttribute("data-year") || "");
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden-card", !(matchedQuery && matchedYear));
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilter);
    }

    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");

    if (results && status && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      var pageInput = document.querySelector(".search-page-form input[name='q']");
      if (pageInput) {
        pageInput.value = queryValue;
      }
      renderSearch(queryValue);
    }

    function renderSearch(queryValue) {
      var query = normalize(queryValue);
      results.innerHTML = "";
      if (!query) {
        status.textContent = "请输入关键词查找影片";
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (movie) {
        return normalize(movie.t + " " + movie.d + " " + movie.g + " " + movie.r + " " + movie.y + " " + movie.c).indexOf(query) !== -1;
      }).slice(0, 240);
      status.textContent = matched.length ? "相关影片" : "未找到相关影片";
      matched.forEach(function (movie) {
        var article = document.createElement("article");
        article.className = "movie-card-item";
        article.innerHTML = [
          '<a class="movie-card" href="' + movie.u + '">',
          '<span class="poster-frame"><img src="' + movie.i + '" alt="' + escapeHtml(movie.t) + '" loading="lazy"><span class="poster-shade"></span><span class="type-badge">' + escapeHtml(movie.c) + '</span><span class="category-badge">' + escapeHtml(movie.k) + '</span></span>',
          '<span class="movie-info"><span class="movie-title">' + escapeHtml(movie.t) + '</span><span class="movie-desc">' + escapeHtml(movie.d) + '</span><span class="movie-meta"><span>' + escapeHtml(movie.y) + '</span><span>' + escapeHtml(movie.r) + '</span></span><span class="tag-row"><span>' + escapeHtml(movie.g) + '</span></span></span>',
          '</a>'
        ].join("");
        results.appendChild(article);
      });
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
})();
