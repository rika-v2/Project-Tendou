function initNavbar() {
    const scriptUrl = document.currentScript
        ? new URL(document.currentScript.src, window.location.href)
        : new URL('navbar-init.js', window.location.href);
    const navbarUrl = new URL('navbar.html', scriptUrl).href;

    fetch(navbarUrl)
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('navbar-container');
            if (!container) return;
            container.innerHTML = html;
            document.body.classList.add('page-loaded');
            setupNavbarTransitions();
        })
        .catch(() => {
            const container = document.getElementById('navbar-container');
            if (container) container.innerHTML = '<p class="text-red-400 p-4">Failed to load navigation.</p>';
        });
}

function setupNavbarTransitions() {
    const body = document.body;
    const isFileProtocol = location.protocol === 'file:';

    if (isFileProtocol) {
        const currentPath = location.pathname;
        const isSubfolder = currentPath.includes('/Tech%20Files/') || currentPath.includes('/Tech Files/')
            || currentPath.includes('/Post%20Haste/') || currentPath.includes('/Post Haste/');
        const pathPrefix = isSubfolder ? '../' : '';

        const adjustRoots = (selector, attrName) => {
            document.querySelectorAll(selector).forEach(element => {
                const value = element.getAttribute(attrName);
                if (value && value.startsWith('/')) {
                    element.setAttribute(attrName, pathPrefix + value.slice(1));
                }
            });
        };

        adjustRoots('a[href^="/"]', 'href');
        adjustRoots('img[src^="/"]', 'src');
        adjustRoots('link[href^="/"]', 'href');
        adjustRoots('script[src^="/"]', 'src');
    }

    const links = document.querySelectorAll('a.page-transition');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            if (event.defaultPrevented) return;
            const href = link.getAttribute('href') || '';
            if (link.target || href.includes('mailto:') || href.includes('javascript:') || href.startsWith('#')) return;
            if (!isFileProtocol && link.origin !== location.origin) return;
            event.preventDefault();
            body.classList.add('page-leaving');
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        });
    });

    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const menu = document.getElementById('nav-mobile');
            if (menu) menu.classList.toggle('hidden');
        });
    }
}

function initAmbientMusic() {
    // Only create audio element once
    if (document.getElementById('ambientMusic')) return;
    
    const audio = document.createElement('audio');
    audio.id = 'ambientMusic';
    audio.loop = true;
    audio.volume = 0.3;
    
    const source = document.createElement('source');
    source.src = window.location.protocol === 'file:' && window.location.pathname.includes('Post Haste') ? '../audio/命に嫌われているまふまふ歌ってみた.mp3' : 'audio/命に嫌われているまふまふ歌ってみた.mp3';
    source.type = 'audio/mpeg';
    
    audio.appendChild(source);
    document.body.appendChild(audio);
    
    // Try autoplay
    audio.play().catch(() => {
        document.addEventListener('click', () => audio.play(), { once: true });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initAmbientMusic();
});
