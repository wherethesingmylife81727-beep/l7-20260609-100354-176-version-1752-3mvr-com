(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    function setHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-target") || 0));
                start();
            });
        });
        show(0);
        start();
    }

    function setPageFilter() {
        var input = document.querySelector(".page-filter");
        var clear = document.querySelector(".clear-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!input || !cards.length) {
            return;
        }
        function apply() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
            });
        }
        input.addEventListener("input", apply);
        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                apply();
                input.focus();
            });
        }
    }

    function createResultCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        var link = document.createElement("a");
        link.className = "card-link";
        link.href = item.url;
        link.setAttribute("aria-label", item.title);
        var figure = document.createElement("figure");
        figure.className = "poster-wrap";
        var img = document.createElement("img");
        img.src = item.cover;
        img.alt = item.title;
        img.loading = "lazy";
        var play = document.createElement("span");
        play.className = "play-mark";
        var year = document.createElement("span");
        year.className = "year-badge";
        year.textContent = item.year;
        var body = document.createElement("div");
        body.className = "card-body";
        var title = document.createElement("h3");
        title.textContent = item.title;
        var meta = document.createElement("p");
        meta.textContent = item.region + " · " + item.type;
        figure.appendChild(img);
        figure.appendChild(play);
        figure.appendChild(year);
        body.appendChild(title);
        body.appendChild(meta);
        link.appendChild(figure);
        link.appendChild(body);
        article.appendChild(link);
        return article;
    }

    function setSearchPage() {
        var form = document.getElementById("siteSearchForm");
        var input = document.getElementById("siteSearchInput");
        var results = document.getElementById("searchResults");
        if (!form || !input || !results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var value = input.value.trim().toLowerCase();
            results.innerHTML = "";
            if (!value) {
                return;
            }
            var found = window.SEARCH_INDEX.filter(function (item) {
                return item.text.indexOf(value) !== -1;
            }).slice(0, 120);
            found.forEach(function (item) {
                results.appendChild(createResultCard(item));
            });
            if (!found.length) {
                var empty = document.createElement("p");
                empty.className = "empty-result";
                empty.textContent = "没有找到匹配影片";
                results.appendChild(empty);
            }
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
            var next = new URL(window.location.href);
            next.searchParams.set("q", input.value.trim());
            window.history.replaceState({}, "", next);
        });
        input.addEventListener("input", render);
        render();
    }

    window.initMoviePlayer = function (source, playerId) {
        var shell = document.getElementById(playerId);
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var loading = shell.querySelector(".player-loading");
        var message = shell.querySelector(".player-message");
        var prepared = false;
        var hls = null;

        function setLoading(active) {
            if (loading) {
                loading.classList.toggle("is-visible", active);
            }
        }

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text || "";
            message.classList.toggle("is-visible", Boolean(text));
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            setLoading(true);
            setMessage("");
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setLoading(false);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setLoading(false);
                        setMessage("播放加载失败，请稍后重试");
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setLoading(false);
                }, { once: true });
                video.addEventListener("error", function () {
                    setLoading(false);
                    setMessage("播放加载失败，请稍后重试");
                });
            } else {
                video.src = source;
                setLoading(false);
            }
        }

        function start() {
            prepare();
            hideCover();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("点击视频区域继续播放");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", hideCover);
        video.addEventListener("waiting", function () {
            setLoading(true);
        });
        video.addEventListener("playing", function () {
            setLoading(false);
            setMessage("");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setMenu();
        setHero();
        setPageFilter();
        setSearchPage();
    });
}());
