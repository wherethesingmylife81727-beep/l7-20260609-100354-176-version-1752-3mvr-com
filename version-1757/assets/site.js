(function () {
    function closestForm(element) {
        while (element && element.tagName !== 'FORM') {
            element = element.parentElement;
        }
        return element;
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-back-top]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var previous = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-list-filter]').forEach(function (toolbar) {
        var keyword = toolbar.querySelector('[data-filter-keyword]');
        var category = toolbar.querySelector('[data-filter-category]');
        var year = toolbar.querySelector('[data-filter-year]');
        var root = toolbar.closest('main') || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));

        function applyFilter() {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var c = category ? category.value : '';
            var y = year ? year.value : '';
            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var visible = true;
                if (q && text.indexOf(q) === -1) {
                    visible = false;
                }
                if (c && cardCategory !== c) {
                    visible = false;
                }
                if (y && cardYear !== y) {
                    visible = false;
                }
                card.style.display = visible ? '' : 'none';
            });
        }

        [keyword, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
