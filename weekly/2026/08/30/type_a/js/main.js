/* Weekly archive navigation */
(() => {
    const box = document.querySelector('.week-calendar');
    if (!box) return;

    const title = box.querySelector('.cal-title');
    const grid = box.querySelector('.cal-weeks');
    const selected = box.querySelector('.cal-selected');
    const prev = box.querySelector('.cal-prev');
    const next = box.querySelector('.cal-next');
    const todayLink = box.querySelector('.today-link');

    const today = new Date();
    const params = new URLSearchParams(location.search);
    const initial = params.get('week');

    let viewDate = initial
        ? new Date(initial + 'T12:00:00')
        : new Date(today.getFullYear(), today.getMonth(), 1);

    if (Number.isNaN(viewDate.getTime())) {
        viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const availableWeeks = new Map();

    function startOfWeek(date) {
        const d = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);

        return d;
    }

    function isoDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function weekKey(date) {
        return isoDate(startOfWeek(date));
    }

    function formatWeek(date) {
        const s = startOfWeek(date);
        const e = new Date(s);

        e.setDate(e.getDate() + 6);

        const opts = {
            month: 'short',
            day: 'numeric'
        };

        return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
    }

    function getArchiveFile(year, month) {
        return `weekly/${year}/${String(month + 1).padStart(2, '0')}/archive.html`;
    }

    async function loadArchive(year, month) {
        availableWeeks.clear();

        const archiveUrl = getArchiveFile(year, month);

        try {
            const response = await fetch(archiveUrl);

            if (!response.ok) {
                return;
            }

            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            doc.querySelectorAll('#weekly-archive [data-week][data-url]')
                .forEach(item => {
                    const week = item.dataset.week;
                    const url = item.dataset.url;

                    availableWeeks.set(week, url);
                });
        }
        catch (error) {
            console.error('Failed to load weekly archive:', error);
        }
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    function render() {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        title.textContent = viewDate.toLocaleDateString(
            undefined,
            {
                month: 'long',
                year: 'numeric'
            }
        );

        grid.innerHTML = '';

        const first = new Date(year, month, 1);
        const start = new Date(year, month, 1 - first.getDay());

        const activeWeek = weekKey(
            new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                Math.min(viewDate.getDate(), 28)
            )
        );

        for (let i = 0; i < 42; i++) {
            const d = new Date(start);

            d.setDate(start.getDate() + i);

            const day = document.createElement('button');

            day.type = 'button';
            day.className = 'cal-day';

            if (d.getMonth() !== month) {
                day.classList.add('other');
            }

            if (isSameDay(d, today)) {
                day.classList.add('today');
            }

            const archiveUrl = availableWeeks.get(weekKey(d));

            if (archiveUrl) {
                day.classList.add('archive');
            }

            if (weekKey(d) === weekKey(today)) {
                day.classList.add('current-week');
            }

            day.textContent = d.getDate();
            day.title = `View week: ${formatWeek(d)}`;

            day.addEventListener('click', () => {
                if (!archiveUrl) {
                    return;
                }

                const targetUrl =
                    `weekly/${year}/${String(month + 1).padStart(2, '0')}/${archiveUrl}`;

                selected.textContent =
                    `Selected: ${formatWeek(d)}`;

                location.href = targetUrl;
            });

            grid.appendChild(day);
        }

        selected.textContent =
            `Selected: ${formatWeek(viewDate)}`;
    }

    async function refreshCalendar() {
        await loadArchive(
            viewDate.getFullYear(),
            viewDate.getMonth()
        );

        render();
    }

    prev.addEventListener('click', () => {
        viewDate = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth() - 1,
            1
        );

        refreshCalendar();
    });

    next.addEventListener('click', () => {
        viewDate = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth() + 1,
            1
        );

        refreshCalendar();
    });

    todayLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const todayWeek = weekKey(today);
        const archiveUrl = availableWeeks.get(todayWeek);

        if (!archiveUrl) {
            viewDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            await refreshCalendar();
            return;
        }

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');

        location.href =
            `weekly/${year}/${month}/${archiveUrl}`;
    });

    refreshCalendar();
})();