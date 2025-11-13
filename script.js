const catList = document.getElementById("CatList");
const output = document.getElementById("output");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalElement = document.getElementById("cartTotal");

let cart = [];

// Full Page Loader
const pageLoader = document.createElement("div");
pageLoader.className = `
    fixed inset-0 bg-white bg-opacity-70 
    flex justify-center items-center z-50 hidden
`;

pageLoader.innerHTML = `
    <div class="flex space-x-2">
        <div class="w-4 h-4 bg-green-600 rounded-full animate-bounce"></div>
        <div class="w-4 h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
        <div class="w-4 h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
    </div>
`;
document.body.appendChild(pageLoader);


// Show Loader
function showLoader() {
    pageLoader.classList.remove("hidden");
}

// Hide Loader
function hideLoader() {
    pageLoader.classList.add("hidden");
}

// Switching categories automatically updates highlight
function clearActiveCategories() {
    document.querySelectorAll("#CatList a").forEach(a => {
        a.classList.remove("bg-green-700", "text-white", "font-medium");
        a.classList.add("hover:bg-green-200", "text-gray-700");
    });
}

async function fetchCategories() {
    showLoader();
    try {
        const res = await fetch("https://openapi.programming-hero.com/api/categories");
        const data = await res.json();
        hideLoader();

        if (data.status && Array.isArray(data.categories)) {
            const allLi = document.createElement("li");
            allLi.innerHTML = `<a href="#" class="block py-2 px-4 rounded-lg bg-green-700 text-white font-medium">All Trees</a>`;
            const allAnchor = allLi.querySelector("a");

            allAnchor.addEventListener("click", e => {
                e.preventDefault();
                clearActiveCategories();
                allAnchor.classList.add("bg-green-700", "text-white", "font-medium");
                allAnchor.classList.remove("hover:bg-green-200", "text-gray-700");
                fetchAllPlants();
            });

            catList.appendChild(allLi);

            data.categories.forEach(cat => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#" class="block py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-gray-700">${cat.category_name}</a>`;
                const anchor = li.querySelector("a");

                anchor.addEventListener("click", e => {
                    e.preventDefault();
                    clearActiveCategories();
                    anchor.classList.add("bg-green-700", "text-white", "font-medium");
                    anchor.classList.remove("hover:bg-green-200", "text-gray-700");
                    fetchPlantsByCategory(cat.id);
                });

                catList.appendChild(li);
            });
        }
    } catch (err) {
        hideLoader();
        console.error("Error fetching categories:", err);
    }
}

async function fetchAllPlants() {
    showLoader();
    try {
        const res = await fetch("https://openapi.programming-hero.com/api/plants");
        const data = await res.json();
        hideLoader();
        if (data.status && Array.isArray(data.plants)) {
            displayPlants(data.plants);
        }
    } catch (err) {
        hideLoader();
        console.error("Error fetching all plants:", err);
    }
}

async function fetchPlantsByCategory(catId) {
    showLoader();
    try {
        const res = await fetch(`https://openapi.programming-hero.com/api/category/${catId}`);
        const data = await res.json();
        hideLoader();
        if (data.status && Array.isArray(data.plants)) {
            displayPlants(data.plants);
        }
    } catch (err) {
        hideLoader();
        console.error(`Error fetching plants for category ${catId}:`, err);
    }
}

// Plants Display
function displayPlants(plants) {
    output.innerHTML = "";

    if (Array.isArray(plants) && plants.length > 0) {
        const scrollWrapper = document.createElement("div");
        scrollWrapper.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto pr-2";

        plants.forEach(plant => {
            const div = document.createElement("div");
            div.className = "w-50 h-90 border rounded-lg bg-white shadow flex flex-col items-center text-center p-2";

            div.innerHTML = `
                <img src="${plant.image}" alt="${plant.name}" 
                    class="w-full h-40 object-cover rounded mb-2">
                
                <h3 class="text-lg font-semibold mb-2">${plant.name}</h3>
                
                <p class="text-gray-600 text-sm flex-grow overflow-hidden">
                    ${plant.description ? plant.description.slice(0, 80) + "..." : ""}
                </p>
                
                <button 
    class="mt-4 bg-green-600 text-white px-4 py-2 rounded add-to-cart w-full 
           hover:bg-green-700  transition-colors duration-300" 
    data-name="${plant.name}" 
    data-price="${plant.price || 0}">
    ${plant.price ? "Add to Cart (৳" + plant.price + ")" : "Price on request"}
</button>

            `;

            scrollWrapper.appendChild(div);
        });

        output.appendChild(scrollWrapper);

        // Handle Add to Cart
        document.querySelectorAll(".add-to-cart").forEach(btn => {
            btn.addEventListener("click", () => {
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);

                if (!price) return;

                const existing = cart.find(item => item.name === name);
                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ name, price, quantity: 1 });
                }
                renderCart();
            });
        });

    } else {
        output.innerHTML = "<p>No plants available.</p>";
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "flex items-center justify-between bg-green-50 p-2 rounded";

        cartItem.innerHTML = `
            <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-gray-500">৳${item.price} × ${item.quantity}</p>
            </div>
            <button class="text-gray-400 hover:text-red-500 transition">&times;</button>
        `;

        cartItem.querySelector("button").addEventListener("click", () => {
            cart.splice(index, 1);
            renderCart();
        });

        cartItemsContainer.appendChild(cartItem);
    });

    cartTotalElement.textContent = "৳" + total;
}

fetchCategories();
fetchAllPlants();
renderCart();
