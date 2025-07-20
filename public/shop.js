// Shop Panel JavaScript
class ShopPanel {
    constructor() {
        this.currentTab = 'products';
        this.userId = new URLSearchParams(window.location.search).get('userId');
        this.cart = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.loadUserInfo();
        this.loadProducts();
        this.loadCart();
        setInterval(() => this.updateTime(), 1000);
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Support form
        document.getElementById('supportForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendSupportMessage();
        });
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('uz-UZ');
        document.getElementById('currentTime').textContent = timeString;
    }

    async loadUserInfo() {
        try {
            const response = await fetch(`/api/users/${this.userId}`);
            const user = await response.json();
            
            document.getElementById('userName').textContent = user.name;
            document.getElementById('shopName').textContent = user.shopName;
        } catch (error) {
            console.error('User info yuklashda xatolik:', error);
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'border-b-3', 'border-green-600', 'text-green-600');
        });

        // Show selected tab
        document.getElementById(tabName).classList.remove('hidden');

        // Add active class to selected nav button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active', 'border-b-3', 'border-green-600', 'text-green-600');

        this.currentTab = tabName;

        // Load tab content
        switch (tabName) {
            case 'products':
                this.loadProducts();
                break;
            case 'debt':
                this.loadDebtInfo();
                break;
            case 'orders':
                this.loadMyOrders();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products/categories');
            const categories = await response.json();

            const grid = document.getElementById('categoriesGrid');
            grid.innerHTML = '';

            for (const category of categories) {
                const productsResponse = await fetch(`/api/products/category/${category._id}`);
                const products = await productsResponse.json();

                const categoryCard = document.createElement('div');
                categoryCard.innerHTML = `
                    <div class="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div class="flex items-center mb-4">
                            <span class="text-3xl mr-3">${category.icon || '📦'}</span>
                            <h4 class="text-xl font-bold text-gray-800">${category.nameUz}</h4>
                        </div>
                        <p class="text-gray-600 mb-4">${products.length} mahsulot</p>
                        <button onclick="shopPanel.showCategoryProducts('${category._id}')" 
                                class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-eye mr-2"></i>Ko'rish
                        </button>
                    </div>
                `;
                grid.appendChild(categoryCard);
            }
        } catch (error) {
            console.error('Products yuklashda xatolik:', error);
        }
    }

    async showCategoryProducts(categoryId) {
        try {
            const response = await fetch(`/api/products/category/${categoryId}`);
            const products = await response.json();

            // Create modal or new view for products
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white p-8 rounded-xl max-w-4xl max-h-96 overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">Mahsulotlar</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${products.map(product => `
                            <div class="border rounded-lg p-4">
                                <img src="${product.image}" alt="${product.nameUz}" class="w-full h-32 object-cover rounded-lg mb-3">
                                <h4 class="font-bold mb-2">${product.nameUz}</h4>
                                <p class="text-gray-600 mb-3">${product.description || ''}</p>
                                <div class="space-y-2">
                                    ${product.variants.map(variant => `
                                        <div class="flex justify-between items-center">
                                            <span>${variant.size}</span>
                                            <div class="flex items-center space-x-2">
                                                <span class="font-semibold">${variant.price.toLocaleString()} so'm</span>
                                                <button onclick="shopPanel.addToCart('${product._id}', '${variant.size}', ${variant.price}, '${product.nameUz}')" 
                                                        class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                                    <i class="fas fa-cart-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Category products yuklashda xatolik:', error);
        }
    }

    async loadDebtInfo() {
        try {
            const response = await fetch(`/api/users/${this.userId}/debt`);
            const debtInfo = await response.json();

            document.getElementById('totalDebt').textContent = `${debtInfo.amount.toLocaleString()} so'm`;
            document.getElementById('lastPayment').textContent = debtInfo.lastPayment ? 
                new Date(debtInfo.lastPayment).toLocaleDateString('uz-UZ') : 'Hech qachon';
            
            const statusElement = document.getElementById('debtStatus');
            if (debtInfo.blocked) {
                statusElement.textContent = 'Bloklangan';
                statusElement.className = 'font-semibold text-red-600';
            } else {
                statusElement.textContent = 'Faol';
                statusElement.className = 'font-semibold text-green-600';
            }
        } catch (error) {
            console.error('Debt info yuklashda xatolik:', error);
        }
    }

    async loadMyOrders() {
        try {
            const response = await fetch(`/api/orders/customer/${this.userId}`);
            const data = await response.json();

            const tbody = document.getElementById('myOrdersTable');
            tbody.innerHTML = '';

            data.orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.orderNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.items.map(item => `${item.product.nameUz} (${item.quantity})`).join(', ')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toLocaleString()} so'm</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(order.status)}">
                            ${this.getStatusText(order.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Orders yuklashda xatolik:', error);
        }
    }

    async sendSupportMessage() {
        const messageType = document.getElementById('messageType').value;
        const messageText = document.getElementById('messageText').value;

        if (!messageText.trim()) {
            alert('Xabar matnini kiriting');
            return;
        }

        try {
            const response = await fetch('/api/support/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    type: messageType,
                    message: messageText
                })
            });

            if (response.ok) {
                alert('Xabar yuborildi!');
                document.getElementById('messageText').value = '';
            }
        } catch (error) {
            console.error('Support message yuborishda xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    addToCart(productId, variantSize, price, productName) {
        const quantity = prompt(`${productName} (${variantSize}) - Nechta kerak?`, '1');
        if (quantity && parseInt(quantity) > 0) {
            const existingItem = this.cart.find(item => 
                item.productId === productId && item.variant === variantSize
            );
            
            if (existingItem) {
                existingItem.quantity += parseInt(quantity);
            } else {
                this.cart.push({
                    productId,
                    productName,
                    variant: variantSize,
                    quantity: parseInt(quantity),
                    price: price
                });
            }
            
            this.saveCart();
            this.updateCartDisplay();
            alert(`${quantity} ta ${productName} (${variantSize}) savatga qo'shildi!`);
        }
    }

    updateCartDisplay() {
        // Update cart count in header if exists
        const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        // Update cart info in products tab
        this.showCartInfo(cartCount, cartTotal);
    }

    showCartInfo(cartCount, cartTotal) {
        // Remove existing cart info
        const existingCartInfo = document.getElementById('cartInfo');
        if (existingCartInfo) {
            existingCartInfo.remove();
        }

        if (cartCount > 0) {
            const cartInfo = document.createElement('div');
            cartInfo.id = 'cartInfo';
            cartInfo.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50';
            cartInfo.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div>
                        <p class="font-bold">Savatda: ${cartCount} ta mahsulot</p>
                        <p class="text-sm">Jami: ${cartTotal.toLocaleString()} so'm</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="shopPanel.showCart()" class="bg-white text-green-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-100">
                            <i class="fas fa-shopping-cart mr-1"></i>Ko'rish
                        </button>
                        <button onclick="shopPanel.clearCart()" class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
                            <i class="fas fa-trash mr-1"></i>Tozalash
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(cartInfo);
        }
    }

    showCart() {
        if (this.cart.length === 0) {
            alert('Savat bo\'sh');
            return;
        }

        const cartTotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white p-8 rounded-xl max-w-2xl max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold">Savat</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${this.cart.map((item, index) => `
                        <div class="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h4 class="font-bold">${item.productName}</h4>
                                <p class="text-gray-600">${item.variant}</p>
                                <p class="text-sm text-gray-500">${item.price.toLocaleString()} so'm x ${item.quantity}</p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="font-bold text-green-600">${(item.price * item.quantity).toLocaleString()} so'm</span>
                                <button onclick="shopPanel.removeFromCart(${index}); this.closest('.fixed').remove(); shopPanel.showCart();" 
                                        class="text-red-600 hover:text-red-800 p-1">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 pt-4 border-t">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-xl font-bold">Jami:</span>
                        <span class="text-2xl font-bold text-green-600">${cartTotal.toLocaleString()} so'm</span>
                    </div>
                    <div class="flex space-x-4">
                        <button onclick="shopPanel.placeOrder()" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-check mr-2"></i>Buyurtma berish
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Yopish
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }

    clearCart() {
        if (confirm('Savatni tozalamoqchimisiz?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    saveCart() {
        localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem(`cart_${this.userId}`);
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
        }
    }

    async placeOrder() {
        if (this.cart.length === 0) {
            alert('Savat bo\'sh');
            return;
        }

        const paymentMethod = prompt('To\'lov usuli:\n1 - Naqd\n2 - Karta\n3 - Qarz\n\nRaqam kiriting:', '1');
        const paymentMethods = { '1': 'cash', '2': 'card', '3': 'debt' };
        
        if (!paymentMethods[paymentMethod]) {
            alert('Noto\'g\'ri tanlov');
            return;
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: this.userId,
                    items: this.cart.map(item => ({
                        product: item.productId,
                        variant: item.variant,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    paymentMethod: paymentMethods[paymentMethod]
                })
            });

            if (response.ok) {
                const order = await response.json();
                alert(`Buyurtma muvaffaqiyatli berildi!\nBuyurtma raqami: ${order.orderNumber}`);
                this.clearCart();
                // Close modal
                document.querySelector('.fixed.inset-0')?.remove();
            } else {
                const error = await response.json();
                alert(`Xatolik: ${error.error}`);
            }
        } catch (error) {
            console.error('Order berish xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    getStatusClass(status) {
        const classes = {
            'new': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'preparing': 'bg-orange-100 text-orange-800',
            'ready': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'new': 'Yangi',
            'confirmed': 'Tasdiqlangan',
            'preparing': 'Tayyorlanmoqda',
            'ready': 'Tayyor',
            'delivered': 'Yetkazilgan',
            'cancelled': 'Bekor qilingan'
        };
        return texts[status] || status;
    }
}

// Initialize shop panel
const shopPanel = new ShopPanel();