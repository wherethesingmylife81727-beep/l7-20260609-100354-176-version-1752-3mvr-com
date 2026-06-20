(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-year-filter]");
            var genre = scope.querySelector("[data-genre-filter]");
            var parent = scope.parentElement;
            var cards = Array.prototype.slice.call(parent.querySelectorAll("[data-card]"));
            var empty = parent.querySelector("[data-empty-state]");
            var years = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-year") || "";
            }).filter(Boolean))).sort().reverse();
            var genres = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-genre") || "";
            }).filter(Boolean))).sort();
            fillSelect(year, years);
            fillSelect(genre, genres);
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var genreValue = genre ? genre.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var okGenre = !genreValue || card.getAttribute("data-genre") === genreValue;
                    var ok = okKeyword && okYear && okGenre;
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
