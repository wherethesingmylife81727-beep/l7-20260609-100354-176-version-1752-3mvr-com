(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
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
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var grid = panel.parentElement.querySelector("[data-filter-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            function apply() {
                var q = normalize(input && input.value);
                var selectedRegion = normalize(region && region.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var matchesQuery = !q || text.indexOf(q) !== -1;
                    var matchesRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
                    var matchesType = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
                    var matchesYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                    card.classList.toggle("filter-hidden", !(matchesQuery && matchesRegion && matchesType && matchesYear));
                });
            }
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            }, { once: true });
        });
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
            var video = box.querySelector("video");
            var overlay = box.querySelector(".play-overlay");
            var streamUrl = box.getAttribute("data-src");
            var loaded = false;
            var hlsInstance = null;
            if (!video || !streamUrl) {
                return;
            }
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            function play() {
                load();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("is-hidden");
                }
            });
            video.addEventListener("ended", function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
            box.addEventListener("click", function (event) {
                if (event.target === video && video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupBackTop() {
        Array.prototype.slice.call(document.querySelectorAll(".back-top")).forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupImages();
        setupPlayers();
        setupBackTop();
    });
})();
