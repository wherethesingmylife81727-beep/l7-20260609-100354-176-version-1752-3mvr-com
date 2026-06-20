(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        var filterBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-block]"));
        filterBlocks.forEach(function (block) {
            var input = block.querySelector("[data-filter-input]");
            var region = block.querySelector("[data-filter-region]");
            var type = block.querySelector("[data-filter-type]");
            var year = block.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(block.querySelectorAll("[data-card]"));
            var apply = function () {
                var q = input ? input.value.trim().toLowerCase() : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden-card", !ok);
                });
            };
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    });
})();
