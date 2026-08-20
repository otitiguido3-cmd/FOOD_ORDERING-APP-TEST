// =========================================================
// SMART FOOD - ORDER / CONFIRM ORDER PAGE
// =========================================================


// ---------------------------------------------------------
// ORDER PAGE STORAGE KEYS
// These names are intentionally different from main.js
// ---------------------------------------------------------

const ORDER_TRAY_STORAGE_KEY = 'smart-food-tray';

const ORDER_DELIVERY_TYPE_STORAGE_KEY =
    'smart-food-delivery-type';


// ---------------------------------------------------------
// ORDER FEES
// ---------------------------------------------------------

const ORDER_DELIVERY_FEE = 5000;
const ORDER_SERVICE_FEE = 2000;


// =========================================================
// GET ITEMS FROM TRAY
// =========================================================

function getOrderItems() {

    try {

        const storedItems =
            localStorage.getItem(
                ORDER_TRAY_STORAGE_KEY
            );

        if (!storedItems) {
            return [];
        }

        const items = JSON.parse(storedItems);

        if (!Array.isArray(items)) {
            return [];
        }

        return items;

    } catch (error) {

        console.error(
            'Error reading tray:',
            error
        );

        return [];

    }
}


// =========================================================
// GET DELIVERY TYPE
// =========================================================

function getOrderDeliveryType() {

    const type =
        localStorage.getItem(
            ORDER_DELIVERY_TYPE_STORAGE_KEY
        );

    return type === 'dine-in'
        ? 'dine-in'
        : 'delivery';
}


// =========================================================
// SAVE DELIVERY TYPE
// =========================================================

function saveOrderDeliveryType(type) {

    if (
        type === 'dine-in' ||
        type === 'delivery'
    ) {

        localStorage.setItem(
            ORDER_DELIVERY_TYPE_STORAGE_KEY,
            type
        );

    }

}


// =========================================================
// FORMAT CURRENCY
// =========================================================

function formatOrderCurrency(amount) {

    return `UGX: ${Number(amount || 0).toLocaleString()}`;

}


// =========================================================
// BUILD ONE ORDER ITEM
// =========================================================

function createOrderItemHTML(item) {

    const quantity =
        Number(item.quantity) || 1;

    const price =
        Number(item.price) || 0;

    const total =
        price * quantity;

    const image =
        item.image ||
        'images/food-default.png';

    const name =
        item.name ||
        'Food Item';

    const description =
        item.description ||
        'Freshly prepared food';


    return `
        <div class="order-item-row">

            <div class="order-item-meta">

                <div class="order-item-image-box">

                    <img
                        class="order-item-image"
                        src="${image}"
                        alt="${name}"
                    >

                </div>


                <div class="order-item-details">

                    <h4>${name}</h4>

                    <p>${description}</p>

                    <span>
                        ${quantity} × ${formatOrderCurrency(price)}
                    </span>

                </div>

            </div>


            <div class="order-item-total">

                ${formatOrderCurrency(total)}

            </div>

        </div>
    `;
}


// =========================================================
// DISPLAY ORDER ITEMS
// =========================================================

function renderOrderItems() {

    const orderItemsContainer =
        document.querySelector(
            '.order-items-list'
        );

    const emptyState =
        document.querySelector(
            '.order-empty-state'
        );


    if (!orderItemsContainer) {

        console.error(
            'ERROR: .order-items-list was not found in order.html'
        );

        return;

    }


    const items = getOrderItems();


    console.log(
        'Items found for order:',
        items
    );


    // -----------------------------------------------------
    // IF TRAY IS EMPTY
    // -----------------------------------------------------

    if (items.length === 0) {

        orderItemsContainer.innerHTML = '';

        orderItemsContainer.style.display =
            'none';


        if (emptyState) {

            emptyState.style.display =
                'flex';

        }

        return;

    }


    // -----------------------------------------------------
    // IF ITEMS EXIST
    // -----------------------------------------------------

    orderItemsContainer.innerHTML =
        items.map(
            createOrderItemHTML
        ).join('');


    orderItemsContainer.style.display =
        'block';


    if (emptyState) {

        emptyState.style.display =
            'none';

    }

}


// =========================================================
// UPDATE CALCULATIONS
// =========================================================

function updateOrderCalculations() {

    const items = getOrderItems();

    const deliveryType =
        getOrderDeliveryType();


    // -----------------------------------------------------
    // SUBTOTAL
    // -----------------------------------------------------

    const subtotal =
        items.reduce(
            (total, item) => {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 0;

                return total + (price * quantity);

            },
            0
        );


    // -----------------------------------------------------
    // DELIVERY FEE
    // -----------------------------------------------------

    const deliveryFee =
        items.length > 0 &&
        deliveryType === 'delivery'
            ? ORDER_DELIVERY_FEE
            : 0;


    // -----------------------------------------------------
    // SERVICE FEE
    // -----------------------------------------------------

    const serviceFee =
        items.length > 0
            ? ORDER_SERVICE_FEE
            : 0;


    // -----------------------------------------------------
    // TOTAL
    // -----------------------------------------------------

    const total =
        subtotal +
        deliveryFee +
        serviceFee;


    // -----------------------------------------------------
    // UPDATE HTML
    // -----------------------------------------------------

    const feeElements =
        document.querySelectorAll(
            '.calculation .fee'
        );


    if (feeElements.length >= 4) {

        feeElements[0].textContent =
            formatOrderCurrency(subtotal);

        feeElements[1].textContent =
            formatOrderCurrency(deliveryFee);

        feeElements[2].textContent =
            formatOrderCurrency(serviceFee);

        feeElements[3].textContent =
            formatOrderCurrency(total);

    }

}


// =========================================================
// UPDATE DINE-IN / DELIVERY
// =========================================================

function updateOrderDeliverySelection() {

    const deliveryType =
        getOrderDeliveryType();


    const dineIn =
        document.querySelector(
            '.dine-in'
        );

    const delivery =
        document.querySelector(
            '.delivery'
        );

    const tableNumberBox =
        document.querySelector(
            '.table-number-box'
        );


    // Dine in selected
    if (dineIn) {

        dineIn.classList.toggle(
            'selected',
            deliveryType === 'dine-in'
        );

    }


    // Delivery selected
    if (delivery) {

        delivery.classList.toggle(
            'selected',
            deliveryType === 'delivery'
        );

    }


    // Show table number only for dine-in
    if (tableNumberBox) {

        tableNumberBox.style.display =
            deliveryType === 'dine-in'
                ? 'block'
                : 'none';

    }

}


// =========================================================
// UPDATE PLACE ORDER BUTTON
// =========================================================

function updatePlaceOrderButton() {

    const button =
        document.getElementById(
            'place-order-button'
        );


    if (!button) {
        return;
    }


    const items =
        getOrderItems();


    button.disabled =
        items.length === 0;


    button.classList.toggle(
        'disabled',
        items.length === 0
    );

}


// =========================================================
// UPDATE ENTIRE ORDER PAGE
// =========================================================

function updateOrderPage() {

    console.log(
        'Updating order page...'
    );


    renderOrderItems();

    updateOrderCalculations();

    updateOrderDeliverySelection();

    updatePlaceOrderButton();

}


// =========================================================
// INITIALIZE ORDER PAGE
// =========================================================

function initializeOrderPage() {

    console.log(
        'Order page initialized'
    );


    // -----------------------------------------------------
    // DINE IN
    // -----------------------------------------------------

    const dineIn =
        document.querySelector(
            '.dine-in'
        );


    if (dineIn) {

        dineIn.addEventListener(
            'click',
            () => {

                saveOrderDeliveryType(
                    'dine-in'
                );

                updateOrderPage();

            }
        );

    }


    // -----------------------------------------------------
    // DELIVERY
    // -----------------------------------------------------

    const delivery =
        document.querySelector(
            '.delivery'
        );


    if (delivery) {

        delivery.addEventListener(
            'click',
            () => {

                saveOrderDeliveryType(
                    'delivery'
                );

                updateOrderPage();

            }
        );

    }


    // -----------------------------------------------------
    // PLACE ORDER
    // -----------------------------------------------------

    const placeOrderButton =
        document.getElementById(
            'place-order-button'
        );


    if (placeOrderButton) {

        placeOrderButton.addEventListener(
            'click',
            (event) => {

                event.preventDefault();


                const items =
                    getOrderItems();


                if (items.length === 0) {

                    alert(
                        'Your tray is empty.'
                    );

                    return;

                }


                alert(
                    'Order placed successfully!'
                );

            }
        );

    }


    // -----------------------------------------------------
    // FIRST PAGE UPDATE
    // -----------------------------------------------------

    updateOrderPage();

}


// =========================================================
// START ORDER PAGE
// =========================================================

if (
    document.readyState === 'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeOrderPage
    );

} else {

    initializeOrderPage();

}