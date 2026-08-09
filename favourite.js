// Favourite page script: tracks ordered food items, ranks them by frequency,
// and displays the most ordered favourites on the favourites page.

// Store the most-ordered food items in browser storage so they persist across pages.
const FAVOURITE_STORAGE_KEY = 'smart-food-favourites';
const FAVOURITE_ORDER_THRESHOLD = 1;

// Read the saved favourite ranking list from localStorage.
function getFavouriteOrders() {
    try {
        const stored = localStorage.getItem(FAVOURITE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

// Save the ranked favourites back to localStorage.
function saveFavouriteOrders(items) {
    localStorage.setItem(FAVOURITE_STORAGE_KEY, JSON.stringify(items));
}

// Make food names compare safely even if the casing or spacing differs.
function normalizeFoodName(name) {
    return String(name || '').trim().toLowerCase();
}

// Define the food details that should appear on the favourites page.
function getFavouriteFoodData(name) {
    const foodCatalog = [
        {
            name: 'Beef Burger',
            description: 'Juicy beef patty with tomato, cheese and veggies.',
            image: 'images/beef-bugger.png',
            price: 18000,
            rating: '4.6 (128)'
        },
        {
            name: 'Pepperoni Pizza',
            description: 'Classic pizza with pepperoni and mozzarella cheese.',
            image: 'images/pizza.png',
            price: 15000,
            rating: '4.3 (122)'
        },
        {
            name: 'Cake',
            description: 'Soft and tasty cake for special moments.',
            image: 'images/cake.png',
            price: 20000,
            rating: '4.6 (148)'
        },
        {
            name: 'Coca cola',
            description: 'Chilled coca cola in a 350ml bottle.',
            image: 'images/cola.png',
            price: 18000,
            rating: '4.6 (128)'
        },
        {
            name: 'Fried Chicken',
            description: 'Crispy fried chicken ready to be served.',
            image: 'images/fried-chicken.png',
            price: 10000,
            rating: '4.6 (128)'
        },
        {
            name: 'Sandwich',
            description: 'Sandwich food rich in vitamins and energy.',
            image: 'images/sandwich.png',
            price: 17000,
            rating: '4.6 (128)'
        },
        {
            name: 'Chicken Pasta',
            description: 'Creamy pasta with grilled chicken and white sauce.',
            image: 'images/pasta.png',
            price: 28000,
            rating: '4.6 (128)'
        },
        {
            name: 'Grilled Chicken',
            description: 'Juicy grilled chicken with special herbs and spices.',
            image: 'images/grilled-chicken.png',
            price: 15000,
            rating: '4.9 (120)'
        },
        {
            name: 'Pasta',
            description: 'Delicious pasta with your favourite sauce.',
            image: 'images/pasta.png',
            price: 15000,
            rating: '4.9 (120)'
        }
    ];

    return foodCatalog.find((item) => normalizeFoodName(item.name) === normalizeFoodName(name)) || null;
}

// Update the favourites list using items already stored in the tray.
function updateFavouriteOrdersFromTray() {
    const trayItems = JSON.parse(localStorage.getItem('smart-food-tray') || '[]');

    if (!trayItems.length) {
        return;
    }

    const favouriteOrders = getFavouriteOrders();

    trayItems.forEach((item) => {
        const existing = favouriteOrders.find((entry) => normalizeFoodName(entry.name) === normalizeFoodName(item.name));
        const baseItem = getFavouriteFoodData(item.name) || {
            name: item.name,
            description: item.description || 'Freshly prepared food.',
            image: item.image || 'images/food-default.png',
            price: item.price || 0,
            rating: '4.5 (100)'
        };

        if (existing) {
            existing.count += item.quantity || 1;
            existing.lastOrdered = new Date().toISOString();
        } else {
            favouriteOrders.push({
                name: baseItem.name,
                description: baseItem.description,
                image: baseItem.image,
                price: baseItem.price,
                rating: baseItem.rating,
                count: item.quantity || 1,
                lastOrdered: new Date().toISOString()
            });
        }
    });

    const ranked = favouriteOrders
        .filter((entry) => entry.count >= FAVOURITE_ORDER_THRESHOLD)
        .sort((a, b) => b.count - a.count || new Date(b.lastOrdered) - new Date(a.lastOrdered));

    saveFavouriteOrders(ranked);
    renderFavouritePage();
}

// Render the ranked favourites into the HTML page.
function renderFavouritePage() {
    const listContainer = document.getElementById('favourite-list');
    if (!listContainer) {
        return;
    }

    const favouriteOrders = getFavouriteOrders();

    if (!favouriteOrders.length) {
        listContainer.innerHTML = `
            <div class="favourite">
                <div class="favourit-img">
                    <img src="images/your_tray_is_empty.png" alt="No favourite yet">
                </div>
                <div class="favourit-content">
                    <h4>No favourite yet !!</h4>
                    <p>Your most ordered dishes will appear here.</p>
                    <div class="rating-row">
                        <span>Start ordering from the menu or home page</span>
                    </div>
                    <h4></h4>
                </div>
                <div class="favourit-symbol">
                    <img src="images/favourite.png" alt="Favourite item">
                </div>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = favouriteOrders.map((item, index) => `
        <div class="favourite">
            <div class="favourit-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="favourit-content">
                <h4>${index + 1}. ${item.name}</h4>
                <p>${item.description}</p>
                <div class="rating-row">
                    <img src="images/empty star.png" alt="Rating">
                    <span>${item.rating}</span>
                </div>
                <h4>UGX: ${Number(item.price).toLocaleString()}</h4>
            </div>
            <div class="favourit-symbol">
                <img src="images/favourite.png" alt="Favourite item">
            </div>
        </div>
    `).join('');
}

// Increase the count for a food item whenever it is ordered.
function trackFavouriteOrder(name) {
    const food = getFavouriteFoodData(name);
    const favouriteOrders = getFavouriteOrders();
    const existing = favouriteOrders.find((entry) => normalizeFoodName(entry.name) === normalizeFoodName(name));

    if (existing) {
        existing.count += 1;
        existing.lastOrdered = new Date().toISOString();
    } else {
        favouriteOrders.push({
            name: food?.name || name,
            description: food?.description || 'Freshly prepared food.',
            image: food?.image || 'images/food-default.png',
            price: food?.price || 0,
            rating: food?.rating || '4.5 (100)',
            count: 1,
            lastOrdered: new Date().toISOString()
        });
    }

    const ranked = favouriteOrders
        .filter((entry) => entry.count >= FAVOURITE_ORDER_THRESHOLD)
        .sort((a, b) => b.count - a.count || new Date(b.lastOrdered) - new Date(a.lastOrdered));

    saveFavouriteOrders(ranked);
    renderFavouritePage();
}

// Load the favourites list when the page opens.
function initializeFavouritePage() {
    renderFavouritePage();

    if (typeof window !== 'undefined') {
        window.addEventListener('storage', (event) => {
            if (event.key === 'smart-food-tray') {
                updateFavouriteOrdersFromTray();
            }
        });
    }
}

// Listen for clicks on menu and home-page add buttons so orders are counted automatically.
function attachFavouriteTracking() {
    document.addEventListener('click', (event) => {
        const addButton = event.target.closest('.food_item_add, .order_now');
        if (!addButton) {
            return;
        }

        const card = addButton.closest('.all-food_items, .special_1, .special_2');
        if (!card) {
            return;
        }

        const title = card.querySelector('h4')?.textContent?.trim();
        if (title) {
            trackFavouriteOrder(title);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeFavouritePage();
        attachFavouriteTracking();
    });
} else {
    initializeFavouritePage();
    attachFavouriteTracking();
}
