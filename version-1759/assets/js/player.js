(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.initMoviePlayer = function (url) {
        onReady(function () {
            var video = document.querySelector("[data-player-video]");
            var overlay = document.querySelector("[data-player-overlay]");
            if (!video || !url) {
                return;
            }
            var hlsInstance = null;
            function load() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            function start() {
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };
})();
