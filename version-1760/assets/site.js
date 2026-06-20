(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function initImages() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      }, { once: true });
    });
  }

  function initNavigation() {
    var button = qs('.nav-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var thumbs = qsa('[data-hero-thumb]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFiltering() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var keyword = qs('[data-filter-keyword]', scope);
      var year = qs('[data-filter-year]', scope);
      var region = qs('[data-filter-region]', scope);
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-empty]', scope);
      var filterButton = qs('.filter-button', scope);

      function apply() {
        var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var matched = true;

          if (keywordValue && haystack.indexOf(keywordValue) === -1) {
            matched = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            matched = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      if (filterButton) {
        filterButton.addEventListener('click', apply);
      }

      [keyword, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !window.MOVIES) {
      return;
    }

    var input = qs('[data-search-input]', root);
    var results = qs('[data-search-results]', root);
    var empty = qs('[data-search-empty]', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function render(value) {
      var term = value.trim().toLowerCase();
      if (!results) {
        return;
      }

      if (!term) {
        results.innerHTML = '';
        if (empty) {
          empty.style.display = 'block';
          empty.textContent = '输入片名、地区、年份或类型，快速查找想看的影片。';
        }
        return;
      }

      var matched = window.MOVIES.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags
        ].join(' ').toLowerCase().indexOf(term) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(function (movie) {
        return '<article class="movie-card" data-card>' +
          '<a class="poster-frame" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-score">' + escapeHtml(movie.rating) + '</span>' +
            '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
            '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
          '</div>' +
        '</article>';
      }).join('');

      initImages();
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
        empty.textContent = matched.length ? '' : '没有找到匹配影片，请更换关键词再试。';
      }
    }

    var form = qs('[data-search-form]', root);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-player-overlay]', player);
      var button = qs('[data-player-button]', player);
      var status = qs('[data-player-status]', player);
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var ready = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function attachStream() {
        if (!video || !stream || ready) {
          return Promise.resolve();
        }

        ready = true;
        setStatus('正在加载影片...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请稍后重试');
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }

        setStatus('视频加载失败，请更换浏览器重试');
        return Promise.resolve();
      }

      function play() {
        if (!video) {
          return;
        }

        attachStream().then(function () {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && playPromise.then) {
            playPromise.then(function () {
              if (overlay) {
                overlay.classList.add('is-hidden');
              }
              setStatus('');
            }).catch(function () {
              setStatus('点击播放按钮继续观看');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('ended', function () {
          if (hlsInstance) {
            hlsInstance.stopLoad();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImages();
    initNavigation();
    initHero();
    initFiltering();
    initSearchPage();
    initPlayers();
  });
})();
