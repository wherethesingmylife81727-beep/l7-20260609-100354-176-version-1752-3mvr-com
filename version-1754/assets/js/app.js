function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
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

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            stop();
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var category = scope.querySelector("[data-filter-category]");
        var sort = scope.querySelector("[data-filter-sort]");
        var grid = scope.querySelector(".filter-grid");
        var empty = scope.querySelector("[data-empty-state]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

        function apply() {
            var query = normalizeText(input ? input.value : "");
            var categoryValue = category ? category.value : "";
            var sortValue = sort ? sort.value : "hot";
            var visible = [];

            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year")
                ].join(" "));
                var okText = !query || haystack.indexOf(query) !== -1;
                var okCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
                var ok = okText && okCategory;
                card.hidden = !ok;
                if (ok) {
                    visible.push(card);
                }
            });

            visible.sort(function (a, b) {
                var yearA = Number(a.getAttribute("data-year")) || 0;
                var yearB = Number(b.getAttribute("data-year")) || 0;
                var titleA = a.getAttribute("data-title") || "";
                var titleB = b.getAttribute("data-title") || "";
                if (sortValue === "new") {
                    return yearB - yearA;
                }
                if (sortValue === "old") {
                    return yearA - yearB;
                }
                if (sortValue === "title") {
                    return titleA.localeCompare(titleB, "zh-Hans-CN");
                }
                return 0;
            });

            visible.forEach(function (card) {
                grid.appendChild(card);
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible.length === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (category) {
            category.addEventListener("change", apply);
        }
        if (sort) {
            sort.addEventListener("change", apply);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }
        apply();
    });
}

function setupVideoPlayer(options) {
    ready(function () {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var loaded = false;
        if (!video || !button || !options.source) {
            return;
        }

        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(options.source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
            } else {
                video.src = options.source;
            }
        }

        function start() {
            bindSource();
            button.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });
    });
}

ready(function () {
    initNavigation();
    initHero();
    initFilters();
});
