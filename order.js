// =========================================================
// ORDRING APP - ORDER / CONFIRM ORDER PAGE
// FINAL ORDER.JS
// =========================================================


// =========================================================
// STORAGE KEYS
// =========================================================

const ORDER_TRAY_STORAGE_KEY = 'smart-food-tray';

const ORDER_DELIVERY_TYPE_STORAGE_KEY =
    'smart-food-delivery-type';


// =========================================================
// ORDER FEES
// =========================================================

const ORDER_DELIVERY_FEE = 5000;
const ORDER_SERVICE_FEE = 2000;


// =========================================================
// GET ITEMS FROM TRAY
// =========================================================

function getOrderItems() {

    const possibleKeys = [
        'smart-food-tray',
        'trayItems',
        'cart',
        'tray'
    ];

    for (const key of possibleKeys) {

        try {

            const storedItems =
                localStorage.getItem(key);

            if (!storedItems) {
                continue;
            }

            const items = JSON.parse(storedItems);

            if (Array.isArray(items) && items.length > 0) {

                // Keep the main tray storage synchronized
                if (key !== ORDER_TRAY_STORAGE_KEY) {

                    localStorage.setItem(
                        ORDER_TRAY_STORAGE_KEY,
                        JSON.stringify(items)
                    );

                }

                return items;
            }

        } catch (error) {

            console.error(
                'Error reading tray:',
                error
            );

        }

    }

    return [];
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
// CREATE ORDER ITEM
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
                        onerror="this.src='images/food-default.png'"
                    >

                </div>

                <div class="order-item-details">

                    <h4>${name}</h4>

                    <p>${description}</p>

                    <span>
                        ${quantity} ×
                        ${formatOrderCurrency(price)}
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

    const container =
        document.querySelector('.order-items-list');

    const emptyState =
        document.querySelector('.order-empty-state');

    if (!container) {

        console.error(
            '.order-items-list not found.'
        );

        return;

    }

    const items = getOrderItems();


    // -----------------------------------------------------
    // EMPTY TRAY
    // -----------------------------------------------------

    if (items.length === 0) {

        container.innerHTML = '';

        container.style.display = 'none';

        if (emptyState) {
            emptyState.style.display = 'flex';
        }

        return;
    }


    // -----------------------------------------------------
    // ITEMS EXIST
    // -----------------------------------------------------

    container.innerHTML =
        items
            .map(createOrderItemHTML)
            .join('');

    container.style.display = 'block';

    if (emptyState) {
        emptyState.style.display = 'none';
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

                return total +
                    price * quantity;

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
    // UPDATE PAGE
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
        document.querySelector('.dine-in');

    const delivery =
        document.querySelector('.delivery');

    const tableNumberBox =
        document.querySelector('.table-number-box');


    // -----------------------------------------------------
    // DINE IN
    // -----------------------------------------------------

    if (dineIn) {

        dineIn.classList.toggle(
            'selected',
            deliveryType === 'dine-in'
        );

    }


    // -----------------------------------------------------
    // DELIVERY
    // -----------------------------------------------------

    if (delivery) {

        delivery.classList.toggle(
            'selected',
            deliveryType === 'delivery'
        );

    }


    // -----------------------------------------------------
    // TABLE NUMBER
    // -----------------------------------------------------

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

        console.error(
            'Place Order button not found.'
        );

        return;

    }

    const items =
        getOrderItems();

    const hasItems =
        items.length > 0;


    // -----------------------------------------------------
    // ENABLE / DISABLE REAL BUTTON
    // -----------------------------------------------------

    button.disabled =
        !hasItems;


    // -----------------------------------------------------
    // CSS STATE
    // -----------------------------------------------------

    button.classList.toggle(
        'disabled',
        !hasItems
    );


    // -----------------------------------------------------
    // ACCESSIBILITY
    // -----------------------------------------------------

    button.setAttribute(
        'aria-disabled',
        String(!hasItems)
    );


    // -----------------------------------------------------
    // CONTROL LINKS INSIDE BUTTON
    // -----------------------------------------------------

    const links =
        button.querySelectorAll('a');

    links.forEach(function(link) {

        if (hasItems) {

            link.classList.remove(
                'order-link-disabled'
            );

            link.removeAttribute(
                'aria-disabled'
            );

        } else {

            link.classList.add(
                'order-link-disabled'
            );

            link.setAttribute(
                'aria-disabled',
                'true'
            );

        }

    });


    console.log(
        'PLACE ORDER:',
        hasItems
            ? 'ENABLED'
            : 'DISABLED'
    );

}


// =========================================================
// CALCULATE FINAL ORDER
// =========================================================

function calculateFinalOrder() {

    const items =
        getOrderItems();

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

                return total +
                    price * quantity;

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


    return {

        items,
        deliveryType,
        subtotal,
        deliveryFee,
        serviceFee,
        total

    };

}


// =========================================================
// PLACE ORDER
// =========================================================

function placeOrder() {

    console.log(
        'PLACE ORDER FUNCTION STARTED'
    );


    // -----------------------------------------------------
    // GET TRAY
    // -----------------------------------------------------

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // STOP IF EMPTY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return false;

    }


    console.log(
        'Food found:',
        items
    );


    // -----------------------------------------------------
    // CALCULATE ORDER
    // -----------------------------------------------------

    const order =
        calculateFinalOrder();


    // -----------------------------------------------------
    // GENERATE ORDER NUMBER
    // -----------------------------------------------------

    const orderNumber =
        'ORD-' +
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    // -----------------------------------------------------
    // SPECIAL INSTRUCTIONS
    // -----------------------------------------------------

    const instructionsElement =
        document.getElementById(
            'special-instruction-textarea'
        );

    const specialInstructions =
        instructionsElement
            ? instructionsElement.value.trim()
            : '';


    // -----------------------------------------------------
    // TABLE NUMBER
    // -----------------------------------------------------

    const tableElement =
        document.getElementById(
            'table-number'
        );

    const tableNumber =
        tableElement
            ? tableElement.value
            : '';


    // -----------------------------------------------------
    // CREATE COMPLETE ORDER
    // -----------------------------------------------------

    const completeOrder = {

        orderNumber: orderNumber,

        items: order.items,

        deliveryType:
            order.deliveryType,

        subtotal:
            order.subtotal,

        deliveryFee:
            order.deliveryFee,

        serviceFee:
            order.serviceFee,

        total:
            order.total,

        tableNumber:
            tableNumber,

        specialInstructions:
            specialInstructions,

        status:
            'Order Received',

        estimatedPreparationTime:
            '20-30 minutes',

        createdAt:
            new Date().toISOString()

    };


    // -----------------------------------------------------
    // SAVE ORDER
    // -----------------------------------------------------

    try {

        localStorage.setItem(
            'smart-food-current-order',
            JSON.stringify(
                completeOrder
            )
        );

        localStorage.setItem(
            'smart-food-order-number',
            orderNumber
        );

    } catch (error) {

        console.error(
            'Could not save order:',
            error
        );

        alert(
            'Unable to save your order. Please try again.'
        );

        return false;

    }


    console.log(
        'ORDER SUCCESSFULLY SAVED:',
        completeOrder
    );


    // -----------------------------------------------------
    // GO TO SUCCESS PAGE
    // -----------------------------------------------------

    console.log(
        'Navigating to success.html...'
    );

    window.location.assign(
        'success.html'
    );

    return true;

}


// =========================================================
// HANDLE PLACE ORDER BUTTON
// =========================================================

function handlePlaceOrderClick(event) {

    // -----------------------------------------------------
    // ALWAYS STOP DEFAULT LINK BEHAVIOUR
    // -----------------------------------------------------

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    console.log(
        'PLACE ORDER CLICK DETECTED'
    );


    const button =
        document.getElementById(
            'place-order-button'
        );


    // -----------------------------------------------------
    // SAFETY CHECK
    // -----------------------------------------------------

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // BLOCK EMPTY TRAY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        console.log(
            'ORDER BLOCKED: Tray is empty.'
        );

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return;

    }


    // -----------------------------------------------------
    // CHECK BUTTON STATE
    // -----------------------------------------------------

    if (
        button &&
        button.disabled
    ) {

        console.log(
            'Order blocked because button is disabled.'
        );

        return;

    }


    // -----------------------------------------------------
    // PLACE ORDER
    // -----------------------------------------------------

    placeOrder();

}


// =========================================================
// HANDLE LINKS INSIDE PLACE ORDER BUTTON
// =========================================================

function handlePlaceOrderLinkClick(event) {

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // EMPTY TRAY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        event.preventDefault();

        event.stopPropagation();

        console.log(
            'SUCCESS PAGE NAVIGATION BLOCKED: Tray is empty.'
        );

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return;

    }


    // -----------------------------------------------------
    // FOOD EXISTS
    // -----------------------------------------------------

    event.preventDefault();

    event.stopPropagation();

    placeOrder();

}


// =========================================================
// CONNECT PLACE ORDER BUTTON
// =========================================================

function initializePlaceOrderButtons() {

    const button =
        document.getElementById(
            'place-order-button'
        );


    if (!button) {

        console.error(
            'ERROR: #place-order-button does not exist.'
        );

        return;

    }


    // -----------------------------------------------------
    // MAIN BUTTON
    // -----------------------------------------------------

    button.onclick = null;

    button.addEventListener(
        'click',
        handlePlaceOrderClick,
        false
    );


    // -----------------------------------------------------
    // LINKS INSIDE BUTTON
    // -----------------------------------------------------

    const links =
        button.querySelectorAll('a');

    links.forEach(function(link) {

        link.addEventListener(
            'click',
            handlePlaceOrderLinkClick,
            false
        );

    });


    console.log(
        'Place Order button and links connected.'
    );

}


// =========================================================
// DINE-IN / DELIVERY BUTTONS
// =========================================================

function initializeDeliveryButtons() {

    const dineIn =
        document.querySelector('.dine-in');

    const delivery =
        document.querySelector('.delivery');


    // -----------------------------------------------------
    // DINE IN
    // -----------------------------------------------------

    if (dineIn) {

        dineIn.addEventListener(
            'click',
            function() {

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

    if (delivery) {

        delivery.addEventListener(
            'click',
            function() {

                saveOrderDeliveryType(
                    'delivery'
                );

                updateOrderPage();

            }
        );

    }

}


// =========================================================
// UPDATE ENTIRE ORDER PAGE
// =========================================================

function updateOrderPage() {

    console.log(
        'Updating Order Page...'
    );

    renderOrderItems();

    updateOrderCalculations();

    updateOrderDeliverySelection();

    updatePlaceOrderButton();

}


// =========================================================
// WATCH FOR TRAY CHANGES
// =========================================================

function startTrayWatcher() {

    let previousTray =
        JSON.stringify(
            getOrderItems()
        );


    setInterval(
        function() {

            const currentTray =
                JSON.stringify(
                    getOrderItems()
                );


            if (
                currentTray !== previousTray
            ) {

                previousTray =
                    currentTray;


                console.log(
                    'Tray changed. Refreshing Order Page.'
                );


                updateOrderPage();

            }

        },
        500
    );

}


// =========================================================
// INITIALIZE ORDER PAGE
// =========================================================

function initializeOrderPage() {

    console.log(
        '================================'
    );

    console.log(
        'ORDER PAGE INITIALIZED'
    );

    console.log(
        '================================'
    );


    // Delivery controls

    initializeDeliveryButtons();


    // Place Order controls

    initializePlaceOrderButtons();


    // Initial update

    updateOrderPage();


    // Watch tray

    startTrayWatcher();

}


// =========================================================
// START APPLICATION
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

}// =========================================================
// ORDRING APP - ORDER / CONFIRM ORDER PAGE
// FINAL ORDER.JS
// =========================================================


// =========================================================
// STORAGE KEYS
// =========================================================

const ORDER_TRAY_STORAGE_KEY = 'smart-food-tray';

const ORDER_DELIVERY_TYPE_STORAGE_KEY =
    'smart-food-delivery-type';


// =========================================================
// ORDER FEES
// =========================================================

const ORDER_DELIVERY_FEE = 5000;
const ORDER_SERVICE_FEE = 2000;


// =========================================================
// GET ITEMS FROM TRAY
// =========================================================

function getOrderItems() {

    const possibleKeys = [
        'smart-food-tray',
        'trayItems',
        'cart',
        'tray'
    ];

    for (const key of possibleKeys) {

        try {

            const storedItems =
                localStorage.getItem(key);

            if (!storedItems) {
                continue;
            }

            const items = JSON.parse(storedItems);

            if (Array.isArray(items) && items.length > 0) {

                // Keep the main tray storage synchronized
                if (key !== ORDER_TRAY_STORAGE_KEY) {

                    localStorage.setItem(
                        ORDER_TRAY_STORAGE_KEY,
                        JSON.stringify(items)
                    );

                }

                return items;
            }

        } catch (error) {

            console.error(
                'Error reading tray:',
                error
            );

        }

    }

    return [];
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
// CREATE ORDER ITEM
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
                        onerror="this.src='images/food-default.png'"
                    >

                </div>

                <div class="order-item-details">

                    <h4>${name}</h4>

                    <p>${description}</p>

                    <span>
                        ${quantity} ×
                        ${formatOrderCurrency(price)}
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

    const container =
        document.querySelector('.order-items-list');

    const emptyState =
        document.querySelector('.order-empty-state');

    if (!container) {

        console.error(
            '.order-items-list not found.'
        );

        return;

    }

    const items = getOrderItems();


    // -----------------------------------------------------
    // EMPTY TRAY
    // -----------------------------------------------------

    if (items.length === 0) {

        container.innerHTML = '';

        container.style.display = 'none';

        if (emptyState) {
            emptyState.style.display = 'flex';
        }

        return;
    }


    // -----------------------------------------------------
    // ITEMS EXIST
    // -----------------------------------------------------

    container.innerHTML =
        items
            .map(createOrderItemHTML)
            .join('');

    container.style.display = 'block';

    if (emptyState) {
        emptyState.style.display = 'none';
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

                return total +
                    price * quantity;

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
    // UPDATE PAGE
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
        document.querySelector('.dine-in');

    const delivery =
        document.querySelector('.delivery');

    const tableNumberBox =
        document.querySelector('.table-number-box');


    // -----------------------------------------------------
    // DINE IN
    // -----------------------------------------------------

    if (dineIn) {

        dineIn.classList.toggle(
            'selected',
            deliveryType === 'dine-in'
        );

    }


    // -----------------------------------------------------
    // DELIVERY
    // -----------------------------------------------------

    if (delivery) {

        delivery.classList.toggle(
            'selected',
            deliveryType === 'delivery'
        );

    }


    // -----------------------------------------------------
    // TABLE NUMBER
    // -----------------------------------------------------

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

        console.error(
            'Place Order button not found.'
        );

        return;

    }

    const items =
        getOrderItems();

    const hasItems =
        items.length > 0;


    // -----------------------------------------------------
    // ENABLE / DISABLE REAL BUTTON
    // -----------------------------------------------------

    button.disabled =
        !hasItems;


    // -----------------------------------------------------
    // CSS STATE
    // -----------------------------------------------------

    button.classList.toggle(
        'disabled',
        !hasItems
    );


    // -----------------------------------------------------
    // ACCESSIBILITY
    // -----------------------------------------------------

    button.setAttribute(
        'aria-disabled',
        String(!hasItems)
    );


    // -----------------------------------------------------
    // CONTROL LINKS INSIDE BUTTON
    // -----------------------------------------------------

    const links =
        button.querySelectorAll('a');

    links.forEach(function(link) {

        if (hasItems) {

            link.classList.remove(
                'order-link-disabled'
            );

            link.removeAttribute(
                'aria-disabled'
            );

        } else {

            link.classList.add(
                'order-link-disabled'
            );

            link.setAttribute(
                'aria-disabled',
                'true'
            );

        }

    });


    console.log(
        'PLACE ORDER:',
        hasItems
            ? 'ENABLED'
            : 'DISABLED'
    );

}


// =========================================================
// CALCULATE FINAL ORDER
// =========================================================

function calculateFinalOrder() {

    const items =
        getOrderItems();

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

                return total +
                    price * quantity;

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


    return {

        items,
        deliveryType,
        subtotal,
        deliveryFee,
        serviceFee,
        total

    };

}


// =========================================================
// PLACE ORDER
// =========================================================

function placeOrder() {

    console.log(
        'PLACE ORDER FUNCTION STARTED'
    );


    // -----------------------------------------------------
    // GET TRAY
    // -----------------------------------------------------

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // STOP IF EMPTY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return false;

    }


    console.log(
        'Food found:',
        items
    );


    // -----------------------------------------------------
    // CALCULATE ORDER
    // -----------------------------------------------------

    const order =
        calculateFinalOrder();


    // -----------------------------------------------------
    // GENERATE ORDER NUMBER
    // -----------------------------------------------------

    const orderNumber =
        'ORD-' +
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    // -----------------------------------------------------
    // SPECIAL INSTRUCTIONS
    // -----------------------------------------------------

    const instructionsElement =
        document.getElementById(
            'special-instruction-textarea'
        );

    const specialInstructions =
        instructionsElement
            ? instructionsElement.value.trim()
            : '';


    // -----------------------------------------------------
    // TABLE NUMBER
    // -----------------------------------------------------

    const tableElement =
        document.getElementById(
            'table-number'
        );

    const tableNumber =
        tableElement
            ? tableElement.value
            : '';


    // -----------------------------------------------------
    // CREATE COMPLETE ORDER
    // -----------------------------------------------------

    const completeOrder = {

        orderNumber: orderNumber,

        items: order.items,

        deliveryType:
            order.deliveryType,

        subtotal:
            order.subtotal,

        deliveryFee:
            order.deliveryFee,

        serviceFee:
            order.serviceFee,

        total:
            order.total,

        tableNumber:
            tableNumber,

        specialInstructions:
            specialInstructions,

        status:
            'Order Received',

        estimatedPreparationTime:
            '20-30 minutes',

        createdAt:
            new Date().toISOString()

    };


    // -----------------------------------------------------
    // SAVE ORDER
    // -----------------------------------------------------

    try {

        localStorage.setItem(
            'smart-food-current-order',
            JSON.stringify(
                completeOrder
            )
        );

        localStorage.setItem(
            'smart-food-order-number',
            orderNumber
        );

    } catch (error) {

        console.error(
            'Could not save order:',
            error
        );

        alert(
            'Unable to save your order. Please try again.'
        );

        return false;

    }


    console.log(
        'ORDER SUCCESSFULLY SAVED:',
        completeOrder
    );


    // -----------------------------------------------------
    // GO TO SUCCESS PAGE
    // -----------------------------------------------------

    console.log(
        'Navigating to success.html...'
    );

    window.location.assign(
        'success.html'
    );

    return true;

}


// =========================================================
// HANDLE PLACE ORDER BUTTON
// =========================================================

function handlePlaceOrderClick(event) {

    // -----------------------------------------------------
    // ALWAYS STOP DEFAULT LINK BEHAVIOUR
    // -----------------------------------------------------

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    console.log(
        'PLACE ORDER CLICK DETECTED'
    );


    const button =
        document.getElementById(
            'place-order-button'
        );


    // -----------------------------------------------------
    // SAFETY CHECK
    // -----------------------------------------------------

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // BLOCK EMPTY TRAY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        console.log(
            'ORDER BLOCKED: Tray is empty.'
        );

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return;

    }


    // -----------------------------------------------------
    // CHECK BUTTON STATE
    // -----------------------------------------------------

    if (
        button &&
        button.disabled
    ) {

        console.log(
            'Order blocked because button is disabled.'
        );

        return;

    }


    // -----------------------------------------------------
    // PLACE ORDER
    // -----------------------------------------------------

    placeOrder();

}


// =========================================================
// HANDLE LINKS INSIDE PLACE ORDER BUTTON
// =========================================================

function handlePlaceOrderLinkClick(event) {

    const items =
        getOrderItems();


    // -----------------------------------------------------
    // EMPTY TRAY
    // -----------------------------------------------------

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        event.preventDefault();

        event.stopPropagation();

        console.log(
            'SUCCESS PAGE NAVIGATION BLOCKED: Tray is empty.'
        );

        alert(
            'Your tray is empty. Please add food before placing your order.'
        );

        updateOrderPage();

        return;

    }


    // -----------------------------------------------------
    // FOOD EXISTS
    // -----------------------------------------------------

    event.preventDefault();

    event.stopPropagation();

    placeOrder();

}


// =========================================================
// CONNECT PLACE ORDER BUTTON
// =========================================================

function initializePlaceOrderButtons() {

    const button =
        document.getElementById(
            'place-order-button'
        );


    if (!button) {

        console.error(
            'ERROR: #place-order-button does not exist.'
        );

        return;

    }


    // -----------------------------------------------------
    // MAIN BUTTON
    // -----------------------------------------------------

    button.onclick = null;

    button.addEventListener(
        'click',
        handlePlaceOrderClick,
        false
    );


    // -----------------------------------------------------
    // LINKS INSIDE BUTTON
    // -----------------------------------------------------

    const links =
        button.querySelectorAll('a');

    links.forEach(function(link) {

        link.addEventListener(
            'click',
            handlePlaceOrderLinkClick,
            false
        );

    });


    console.log(
        'Place Order button and links connected.'
    );

}


// =========================================================
// DINE-IN / DELIVERY BUTTONS
// =========================================================

function initializeDeliveryButtons() {

    const dineIn =
        document.querySelector('.dine-in');

    const delivery =
        document.querySelector('.delivery');


    // -----------------------------------------------------
    // DINE IN
    // -----------------------------------------------------

    if (dineIn) {

        dineIn.addEventListener(
            'click',
            function() {

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

    if (delivery) {

        delivery.addEventListener(
            'click',
            function() {

                saveOrderDeliveryType(
                    'delivery'
                );

                updateOrderPage();

            }
        );

    }

}


// =========================================================
// UPDATE ENTIRE ORDER PAGE
// =========================================================

function updateOrderPage() {

    console.log(
        'Updating Order Page...'
    );

    renderOrderItems();

    updateOrderCalculations();

    updateOrderDeliverySelection();

    updatePlaceOrderButton();

}


// =========================================================
// WATCH FOR TRAY CHANGES
// =========================================================

function startTrayWatcher() {

    let previousTray =
        JSON.stringify(
            getOrderItems()
        );


    setInterval(
        function() {

            const currentTray =
                JSON.stringify(
                    getOrderItems()
                );


            if (
                currentTray !== previousTray
            ) {

                previousTray =
                    currentTray;


                console.log(
                    'Tray changed. Refreshing Order Page.'
                );


                updateOrderPage();

            }

        },
        500
    );

}


// =========================================================
// INITIALIZE ORDER PAGE
// =========================================================

function initializeOrderPage() {

    console.log(
        '================================'
    );

    console.log(
        'ORDER PAGE INITIALIZED'
    );

    console.log(
        '================================'
    );


    // Delivery controls

    initializeDeliveryButtons();


    // Place Order controls

    initializePlaceOrderButtons();


    // Initial update

    updateOrderPage();


    // Watch tray

    startTrayWatcher();

}


// =========================================================
// START APPLICATION
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