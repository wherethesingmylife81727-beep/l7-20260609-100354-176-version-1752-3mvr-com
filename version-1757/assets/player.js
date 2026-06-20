import { H as Hls } from './hls-dru42stk.js';

(function () {
    var frame = document.querySelector('[data-player-frame]');
    if (!frame) {
        return;
    }

    var video = frame.querySelector('video');
    var overlay = frame.querySelector('[data-player-overlay]');
    var source = frame.getAttribute('data-source');
    var hls = null;
    var ready = false;

    function attach() {
        if (!video || !source || ready) {
            return Promise.resolve();
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load();
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        try {
                            hls.recoverMediaError();
                        } catch (error) {
                            resolve();
                        }
                    }
                });
            });
        }

        video.src = source;
        video.load();
        return Promise.resolve();
    }

    function play() {
        attach().then(function () {
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            play();
        });
    }

    if (video) {
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
