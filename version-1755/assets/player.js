(function () {
    window.initMoviePlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video || !sourceUrl) {
            return;
        }

        var frame = video.closest(".player-frame");
        var button = frame ? frame.querySelector(".player-start") : null;
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 90,
                    backBufferLength: 30
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function start() {
            prepare();
            if (button) {
                button.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
