(function () {
    var movies = window.SEARCH_MOVIES || [];
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var category = document.querySelector('[data-search-page-category]');
    var year = document.querySelector('[data-search-page-year]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    function textOf(movie) {
        return [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            movie.oneLine,
            (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
    }

    function card(movie) {
        var tagText = (movie.tags || []).slice(0, 4).join(' ');
        return [
            '<a class="movie-card" href="' + movie.url + '" data-year="' + movie.year + '" data-category="' + movie.category + '" data-search="' + textOf(movie).replace(/"/g, '&quot;') + '">',
            '    <span class="movie-thumb">',
            '        <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
            '        <span class="play-chip">▶</span>',
            '    </span>',
            '    <span class="movie-info">',
            '        <strong>' + movie.title + '</strong>',
            '        <em>' + movie.oneLine + '</em>',
            '        <span class="movie-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span><span>' + movie.year + '</span></span>',
            '        <span class="movie-tags">' + tagText + '</span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function render() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var c = category ? category.value : '';
        var y = year ? year.value : '';
        var filtered = movies.filter(function (movie) {
            if (q && textOf(movie).indexOf(q) === -1) {
                return false;
            }
            if (c && movie.category !== c) {
                return false;
            }
            if (y && movie.year !== y) {
                return false;
            }
            return true;
        });
        if (!q && !c && !y) {
            filtered = filtered.slice(0, 120);
        }
        if (count) {
            count.textContent = String(filtered.length);
        }
        if (results) {
            results.innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty-state">未找到匹配影片</div>';
        }
    }

    var initial = params().get('q') || '';
    if (input) {
        input.value = initial;
    }
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
    }
    [input, category, year].forEach(function (control) {
        if (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        }
    });
    render();
})();
