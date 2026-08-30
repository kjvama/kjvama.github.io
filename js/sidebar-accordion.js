/* =========================================================
   KJVAMA Docs Sidebar
   Level-1 accordion with second-level navigation
   ========================================================= */

const menuData = [
    {
        id: 'project',
        title: 'Project',
        children: [
            { id: 'development-log', title: 'Development Log', path: '#' },
            { id: 'document-register', title: 'Document Register', path: '#', active: true }
        ]
    },
    {
        id: 'standards',
        title: 'Standards',
        children: [
            { id: 'standards-overview', title: 'Overview', path: '#' },
            { id: 'documentation-standards', title: 'Documentation Standards', path: '#' }
        ]
    },
    {
        id: 'design',
        title: 'Design',
        children: [
            { id: 'design-overview', title: 'Overview', path: '#' }
        ]
    },
    {
        id: 'database',
        title: 'Database',
        children: [
            { id: 'database-overview', title: 'Overview', path: '#' },
            { id: 'database-design', title: 'Database Design', path: '#' },
            { id: 'table-schema', title: 'Table Schema', path: '#' }
        ]
    },
    {
        id: 'development',
        title: 'Development',
        children: [
            { id: 'development-overview', title: 'Overview', path: '#' },
            { id: 'aspnet-core', title: 'ASP.NET Core', path: '#' },
            { id: 'mvc', title: 'MVC', path: '#' }
        ]
    },
    {
        id: 'orchard-core',
        title: 'Orchard Core',
        children: [
            { id: 'add-admin-menu', title: 'Add Admin Menu', path: '/sample-docs/guides/add-admin-menu.html' }
        ]
    }
];

(() => {
    'use strict';

    const root = document.getElementById('docsSidebar');

    if (!root) {
        return;
    }

    menuData.forEach(group => {
        const item = document.createElement('section');
        item.className = 'doc-accordion__item';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'doc-accordion__button';

        const label = document.createElement('span');
        label.className = 'doc-accordion__label';
        label.textContent = group.title;

        const indicator = document.createElement('span');
        indicator.className = 'doc-accordion__indicator';
        indicator.setAttribute('aria-hidden', 'true');

        const panel = document.createElement('div');
        panel.className = 'doc-accordion__panel';

        group.children.forEach(child => {
            const link = document.createElement('a');
            link.className = 'doc-accordion__link';
            link.href = child.path || '#';
            link.textContent = child.title;

            if (child.active) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            }

            panel.appendChild(link);
        });

        const openInitially = group.children.some(child => child.active);

        button.setAttribute('aria-expanded', String(openInitially));
        panel.hidden = !openInitially;
        indicator.textContent = openInitially ? '−' : '+';

        button.append(label, indicator);

        button.addEventListener('click', () => {
            const isOpen = button.getAttribute('aria-expanded') === 'true';

            button.setAttribute('aria-expanded', String(!isOpen));
            panel.hidden = isOpen;
            indicator.textContent = isOpen ? '+' : '−';
        });

        item.append(button, panel);
        root.appendChild(item);
    });
})();


/* ---------------------------------------------------------
   View Mode
   Current = current section only (default)
   All     = all sections expanded
   --------------------------------------------------------- */

(() => {
    'use strict';

    const root = document.getElementById('docsSidebar');
    const controls = document.querySelectorAll('input[name="sidebarView"]');

    if (!root || !controls.length) {
        return;
    }

    const getGroups = () =>
        Array.from(root.querySelectorAll('.doc-accordion__item'));

    const setGroupState = (group, open) => {
        const button = group.querySelector('.doc-accordion__button');
        const panel = group.querySelector('.doc-accordion__panel');
        const indicator = group.querySelector('.doc-accordion__indicator');

        if (!button || !panel || !indicator) {
            return;
        }

        button.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        indicator.textContent = open ? '−' : '+';
    };

    const getCurrentGroup = () => {
        const activeLink = root.querySelector('.doc-accordion__link.is-active');
        return activeLink
            ? activeLink.closest('.doc-accordion__item')
            : null;
    };

    const applyViewMode = mode => {
        const groups = getGroups();

        if (mode === 'all') {
            groups.forEach(group => setGroupState(group, true));
            return;
        }

        const currentGroup = getCurrentGroup();

        groups.forEach(group => {
            setGroupState(group, group === currentGroup);
        });
    };

    controls.forEach(control => {
        control.addEventListener('change', () => {
            if (control.checked) {
                applyViewMode(control.value);
            }
        });

        control.addEventListener('click', () => {
            if (control.checked && control.value === 'current') {
                applyViewMode('current');
            }
        });
    });

    applyViewMode('current');
})();
