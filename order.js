const TRAY_STORAGE_KEY = 'smart-food-tray';
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

function getDeliveryType() {
    const storedType = localStorage.getItem(DELIVERY_TYPE_STORAGE_KEY);
    return storedType === 'dine-in' ? 'dine-in' : 'delivery';
}

function saveDeliveryType(type) {
    if (type === 'dine-in' || type === 'delivery') {
        localStorage.setItem(DELIVERY_TYPE_STORAGE_KEY, type);
    }
}

function formatCurrency(value) {
    return `UGX: ${Number(value).toLocaleString()}`;
}

function buildOrderItemRow(item) {
    return `
        <div class="order-item-row">
            <div class="order-item-meta">
                <img class="order-item-image" src="${item.image || 'images/food-default.png'}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x UGX: ${Number(item.price).toLocaleString()}</p>
                </div>
            </div>
            <div class="order-item-total">UGX: ${Number(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `;
}

function updateOrderSummary() {
    const items = getTrayItems();
    const deliveryType = getDeliveryType();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = items.length && deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    const serviceFee = items.length ? SERVICE_FEE : 0;
    const total = subtotal + deliveryFee + serviceFee;

    const feeElements = document.querySelectorAll('.calculation .fee');
    if (feeElements.length >= 4) {
        feeElements[0].textContent = formatCurrency(subtotal);
        feeElements[1].textContent = formatCurrency(deliveryFee);
        feeElements[2].textContent = formatCurrency(serviceFee);
        feeElements[3].textContent = formatCurrency(total);
    }

    const placeOrderButton = document.getElementById('place-order-button');
    if (placeOrderButton) {
        placeOrderButton.disabled = !items.length;
        placeOrderButton.classList.toggle('disabled', !items.length);
    }

    const trayContent = document.querySelector('.tray-page-content');
    if (trayContent) {
        trayContent.classList.toggle('tray-disabled', !items.length);
    }

    const emptyStateBox = document.querySelector('.order-empty-state');
    if (emptyStateBox) {
        if (items.length) {
            emptyStateBox.innerHTML = items.map(buildOrderItemRow).join('');
            emptyStateBox.style.display = 'block';
        } else {
            emptyStateBox.innerHTML = `
                <div class="empty-state-content">
                    <img class="empty-order" src="images/no order.png" alt="">
                    <p>No Order Yet 🍽️ .</p>
                </div>
                <div class="order-items-list"></div>
            `;
            emptyStateBox.style.display = 'flex';
        }
    }

    const dineInTab = document.querySelector('.dine-in');
    const deliveryTab = document.querySelector('.delivery');
    const tableNumberBox = document.querySelector('.table-number-box');

    if (dineInTab && deliveryTab) {
        dineInTab.classList.toggle('selected', deliveryType === 'dine-in');
        deliveryTab.classList.toggle('selected', deliveryType === 'delivery');
    }

    if (tableNumberBox) {
        tableNumberBox.style.display = deliveryType === 'dine-in' ? 'block' : 'none';
    }
}

function initializeOrderPage() {
    const dineInElement = document.querySelector('.dine-in');
    const deliveryElement = document.querySelector('.delivery');
    const placeOrderButton = document.getElementById('place-order-button');

    if (dineInElement) {
        dineInElement.addEventListener('click', () => {
            saveDeliveryType('dine-in');
            updateOrderSummary();
        });
    }

    if (deliveryElement) {
        deliveryElement.addEventListener('click', () => {
            saveDeliveryType('delivery');
            updateOrderSummary();
        });
    }

    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', (event) => {
            event.preventDefault();
            const items = getTrayItems();
            if (!items.length) {
                return;
            }
            alert('Order placed successfully!');
        });
    }

    updateOrderSummary();
}

document.addEventListener('DOMContentLoaded', initializeOrderPage);
