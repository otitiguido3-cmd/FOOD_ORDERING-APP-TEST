const categoryMenu = document.querySelector('.side-item-menu');
const categoryToggleButton = categoryMenu?.querySelector('.side-menu-toggle');
const categoryCloseButton = categoryMenu?.querySelector('.side-menu-close');
const categoryBackdrop = document.getElementById('side-menu-backdrop');
const categoryPanelLinks = categoryMenu?.querySelectorAll('.side-menu-panel a') ?? [];
const trayPageContent = document.querySelector('.tray-page-content');
const TRAY_STORAGE_KEY = 'smart-food-tray';

// Initialize the shared slide-in navigation menu for all app pages
function initializeIndexMenu() {
    const headerToggle = document.querySelector('.toggle-menu');
    const panel = document.getElementById('page-side-menu') || document.getElementById('home-side-menu');
    const menuBackdrop = document.getElementById('page-side-backdrop') || document.getElementById('home-side-backdrop');

    if (!headerToggle || !panel || !menuBackdrop) {
        return;
    }

    // Open the navigation panel and dim the page content behind it
    const openMenu = () => {
        panel.classList.add('open');
        menuBackdrop.classList.add('active');
        document.body.classList.add('menu-open');
        headerToggle.setAttribute('aria-expanded', 'true');
    };

    // Close the navigation panel and restore normal page interaction
    const closeMenu = () => {
        panel.classList.remove('open');
        menuBackdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
        headerToggle.setAttribute('aria-expanded', 'false');
    };

    // Toggle the menu when the header button is clicked
    headerToggle.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = panel.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    const closeButton = panel.querySelector('.side-menu-close');
    closeButton?.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);

    panel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.classList.contains('open')) {
            closeMenu();
        }
    });
}
const DELIVERY_TYPE_STORAGE_KEY = 'smart-food-delivery-type';
const DELIVERY_FEE = 5000;
const SERVICE_FEE = 2000;

function getTrayItems() {
    try {
        const storedItems = localStorage.getItem(TRAY_STORAGE_KEY);
        return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
        return [];
    }
}

function saveTrayItems(items) {
    localStorage.setItem(TRAY_STORAGE_KEY, JSON.stringify(items));
}

function getDeliveryType() {
    return localStorage.getItem(DELIVERY_TYPE_STORAGE_KEY) || 'delivery';
}

function saveDeliveryType(type) {
    if (type === 'dine-in' || type === 'delivery') {
        localStorage.setItem(DELIVERY_TYPE_STORAGE_KEY, type);
    }
}

function showTrayFeedback(message) {
    let toast = document.getElementById('tray-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'tray-toast';
        toast.className = 'tray-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(showTrayFeedback.timer);
    showTrayFeedback.timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function updateTraySummary() {
    const trayItems = getTrayItems();
    const subtotal = trayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryType = getDeliveryType();
    const deliveryFee = trayItems.length && deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    const serviceFee = trayItems.length ? SERVICE_FEE : 0;
    const total = subtotal + deliveryFee + serviceFee;
    const totalQuantity = trayItems.reduce((sum, item) => sum + item.quantity, 0);

    const feeElements = document.querySelectorAll('.calculation .fee');
    if (feeElements.length >= 4) {
        feeElements[0].textContent = `UGX: ${subtotal.toLocaleString()}`;
        feeElements[1].textContent = `UGX: ${deliveryFee.toLocaleString()}`;
        feeElements[2].textContent = `UGX: ${serviceFee.toLocaleString()}`;
        feeElements[3].textContent = `UGX: ${total.toLocaleString()}`;
    }

    const footerLinks = document.querySelectorAll('footer a');
    const trayFooterLink = Array.from(footerLinks).find((link) => {
        const label = link.textContent.trim().toLowerCase();
        const altText = link.querySelector('img')?.getAttribute('alt')?.toLowerCase() || '';
        return link.href.includes('tray.html') || label.includes('tray') || altText.includes('tray');
    });

    footerLinks.forEach((link) => {
        const existingBadge = link.querySelector('.footer-badge');

        if (link === trayFooterLink) {
            if (totalQuantity > 0) {
                if (existingBadge) {
                    existingBadge.textContent = totalQuantity;
                } else {
                    const badgeElement = document.createElement('span');
                    badgeElement.className = 'footer-badge';
                    badgeElement.textContent = totalQuantity;
                    link.appendChild(badgeElement);
                }
            } else if (existingBadge) {
                existingBadge.remove();
            }
        } else if (existingBadge) {
            existingBadge.remove();
        }
    });
}

function setTrayPageState(isEnabled) {
    if (trayPageContent) {
        trayPageContent.classList.toggle('tray-disabled', !isEnabled);
    }
}

function parsePrice(value) {
    const amount = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(amount) ? amount : 0;
}

function buildItemFromCard(card) {
    if (!card) return null;

    const titleElement = card.querySelector('h4') || card.querySelector('.item-title');
    const descriptionElement = card.querySelector('p');
    const priceElement = card.querySelector('.item-price') || card.querySelector('.food_item_content h4:last-of-type');
    const imageElement = card.querySelector('img');

    const name = titleElement ? titleElement.textContent.trim() : 'Food Item';
    const description = descriptionElement ? descriptionElement.textContent.trim() : 'Freshly prepared item';
    const price = parsePrice(priceElement ? priceElement.textContent : '0');
    const image = imageElement ? imageElement.getAttribute('src') : 'images/food-default.png';

    return {
        name,
        description,
        price,
        image,
    };
}

function addItemToTray(item) {
    if (!item) return;

    const trayItems = getTrayItems();
    const existingItem = trayItems.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        trayItems.push({ ...item, quantity: 1 });
    }

    saveTrayItems(trayItems);
    updateTraySummary();
    showTrayFeedback(`${item.name} added to your tray`);

    if (window.location.href.includes('tray.html')) {
        renderTrayPage();
    }
}

function changeTrayItemQuantity(name, change) {
    const trayItems = getTrayItems();
    const updatedItems = trayItems
        .map((item) => {
            if (item.name.toLowerCase() === name.toLowerCase()) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        })
        .filter(Boolean);

    saveTrayItems(updatedItems);
    renderTrayPage();
}

function removeTrayItem(name) {
    const trayItems = getTrayItems().filter((item) => item.name.toLowerCase() !== name.toLowerCase());
    saveTrayItems(trayItems);
    renderTrayPage();
}

function renderTrayPage() {
    const trayContainer = document.querySelector('.tray-items-list');
    if (!trayContainer) return;

    const trayItems = getTrayItems();

    if (!trayItems.length) {
        trayContainer.innerHTML = `
            <div class="empty-state">
                <p>Your tray is empty.</p>
                <img src="your_tray_is_empty.png" alt="Empty tray" class="empty-state-image">
                <small>Add food from the menu or home page to begin.</small>
            </div>
        `;
        setTrayPageState(false);
        updateTraySummary();
        return;
    }

    trayContainer.innerHTML = trayItems.map((item) => `
        <div class="manage-order-box">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-content">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <h4>UGX: ${Number(item.price * item.quantity).toLocaleString()}</h4>
            </div>
            <div class="item-adjustment">
                <button type="button" class="decrease-item" data-name="${item.name}">
                    <img src="images/decrease.png" alt="Decrease item">
                </button>
                <h4>${item.quantity}</h4>
                <button type="button" class="increase-item" data-name="${item.name}">
                    <img src="images/increase.png" alt="Increase item">
                </button>
            </div>
            <div class="item-delete" data-name="${item.name}">
                <img src="images/delete.png" alt="Delete">
            </div>
        </div>
    `).join('');
    setTrayPageState(true);
    updateTraySummary();
}

function initializeTrayPage() {
    const trayContainer = document.querySelector('.tray-items-list');

    if (!trayContainer) {
        const targetSection = document.querySelector('.free-delivery');
        if (targetSection) {
            const container = document.createElement('div');
            container.className = 'tray-items-list';
            targetSection.insertAdjacentElement('afterend', container);
            renderTrayPage();
        }
        return;
    }

    setTrayPageState(false);
    updateTraySummary();
    renderTrayPage();
}

if (categoryMenu && categoryToggleButton && categoryBackdrop) {
    const toggleCategoryMenu = () => {
        const isOpen = categoryMenu.classList.toggle('open');
        categoryMenu.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
        categoryBackdrop.classList.toggle('active', isOpen);
        categoryToggleButton.setAttribute('aria-label', isOpen ? 'Close categories' : 'Open categories');
    };

    categoryToggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        toggleCategoryMenu();
    });

    categoryCloseButton?.addEventListener('click', (event) => {
        event.preventDefault();
        if (categoryMenu.classList.contains('open')) {
            toggleCategoryMenu();
        }
    });

    categoryBackdrop.addEventListener('click', (event) => {
        event.preventDefault();
        if (categoryMenu.classList.contains('open')) {
            toggleCategoryMenu();
        }
    });

    categoryPanelLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (categoryMenu.classList.contains('open')) {
                toggleCategoryMenu();
            }
        });
    });
}

document.addEventListener('click', (event) => {
    const menuAddButton = event.target.closest('.food_item_add');
    if (menuAddButton) {
        event.preventDefault();
        const card = menuAddButton.closest('.all-food_items');
        const item = buildItemFromCard(card);
        addItemToTray(item);
        return;
    }

    const homeAddButton = event.target.closest('.order_now');
    if (homeAddButton) {
        event.preventDefault();
        const card = homeAddButton.closest('.special_1, .special_2');
        const item = buildItemFromCard(card);
        addItemToTray(item);
        return;
    }

    const increaseButton = event.target.closest('.increase-item');
    if (increaseButton) {
        const name = increaseButton.getAttribute('data-name');
        changeTrayItemQuantity(name, 1);
        return;
    }

    const decreaseButton = event.target.closest('.decrease-item');
    if (decreaseButton) {
        const name = decreaseButton.getAttribute('data-name');
        changeTrayItemQuantity(name, -1);
        return;
    }

    const removeButton = event.target.closest('.item-delete');
    if (removeButton) {
        const name = removeButton.getAttribute('data-name');
        removeTrayItem(name);
    }
});

const initializeApp = () => {
    initializeIndexMenu();
    updateTraySummary();

    if (window.location.href.includes('tray.html')) {
        initializeTrayPage();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
