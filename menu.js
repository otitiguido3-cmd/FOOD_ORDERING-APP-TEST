const menuContainer = document.querySelector('.side-item-menu');
const toggleButton = document.querySelector('.side-menu-toggle');
const closeButton = document.querySelector('.side-menu-close');
const backdrop = document.querySelector('.side-menu-backdrop');
const panelLinks = document.querySelectorAll('.side-menu-panel a');

if (menuContainer && toggleButton && backdrop) {
    const toggleMenu = () => {
        const isOpen = menuContainer.classList.toggle('open');
        menuContainer.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
        backdrop.classList.toggle('active', isOpen);
        toggleButton.setAttribute('aria-label', isOpen ? 'Close categories' : 'Open categories');
    };

    toggleButton.addEventListener('click', toggleMenu);

    if (closeButton) {
        closeButton.addEventListener('click', toggleMenu);
    }

    backdrop.addEventListener('click', toggleMenu);

    panelLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (menuContainer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuContainer.classList.contains('open')) {
            toggleMenu();
        }
    });
}
