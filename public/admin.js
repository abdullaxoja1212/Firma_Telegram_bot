// Admin Panel JavaScript

class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.selectedOrders = [];
        this.userId = new URLSearchParams(window.location.search).get('userId');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.loadDashboard();
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

        // Order selection
        document.getElementById('selectAllOrders')?.addEventListener('change', (e) => {
            this.selectAllOrders(e.target.checked);
        });

        // Assign orders
        document.getElementById('assignOrdersBtn')?.addEventListener('click', () => {
            this.showAssignModal();
        });

        // Modal events
        document.getElementById('cancelAssign')?.addEventListener('click', () => {
            this.hideAssignModal();
        });

        document.getElementById('confirmAssign')?.addEventListener('click', () => {
            this.assignOrders();
        });

        // Add Category Modal
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
            this.showAddCategoryModal();
        });

        document.getElementById('cancelCategory')?.addEventListener('click', () => {
            this.hideAddCategoryModal();
        });

        document.getElementById('categoryForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        // Add Admin Modal
        document.getElementById('addAdminBtn')?.addEventListener('click', () => {
            this.showAddAdminModal();
        });

        document.getElementById('cancelAdmin')?.addEventListener('click', () => {
            this.hideAddAdminModal();
        });

        document.getElementById('adminForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAdmin();
        });

        // Add Driver Modal
        document.getElementById('addDriverBtn')?.addEventListener('click', () => {
            this.showAddDriverModal();
        });

        document.getElementById('cancelDriver')?.addEventListener('click', () => {
            this.hideAddDriverModal();
        });

        document.getElementById('driverForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDriver();
        });

        // Add Product Modal
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.showAddProductModal();
        });

        document.getElementById('cancelProduct')?.addEventListener('click', () => {
            this.hideAddProductModal();
        });

        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Status filter
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterOrders(e.target.value);
        });
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('uz-UZ');
        document.getElementById('currentTime').textContent = timeString;
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'border-b-3', 'border-blue-600', 'text-blue-600');
        });

        // Show selected tab
        document.getElementById(tabName).classList.remove('hidden');

        // Add active class to selected nav button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active', 'border-b-3', 'border-blue-600', 'text-blue-600');

        this.currentTab = tabName;

        // Load tab content
        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'drivers':
                this.loadDrivers();
                break;
            case 'admins':
                this.loadAdmins();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();

            document.getElementById('totalOrders').textContent = data.totalOrders || 0;
            document.getElementById('todayOrders').textContent = data.todayOrders || 0;
            document.getElementById('totalCustomers').textContent = data.totalCustomers || 0;
            document.getElementById('pendingOrders').textContent = data.pendingOrders || 0;

            // Load recent orders
            this.loadRecentOrders();
        } catch (error) {
            console.error('Dashboard yuklashda xatolik:', error);
        }
    }

    async loadRecentOrders() {
        try {
            const response = await fetch('/api/admin/orders?limit=5');
            const data = await response.json();

            if (!data || !Array.isArray(data.orders)) {
                console.warn('No orders data received or invalid format');
                return;
            }

            const tbody = document.getElementById('recentOrdersTable');
            tbody.innerHTML = '';

            data.orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.orderNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer?.name || 'N/A'}</td>
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
            console.error('Recent orders yuklashda xatolik:', error);
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            const data = await response.json();

            if (!data || !Array.isArray(data.orders)) {
                console.warn('No orders data received or invalid format');
                return;
            }

            const tbody = document.getElementById('ordersTable');
            tbody.innerHTML = '';

            data.orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" class="order-checkbox rounded" value="${order._id}">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.orderNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer?.name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customer?.shopName || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.items?.map(item => `${item.product?.nameUz || 'N/A'} (${item.quantity})`).join(', ') || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toLocaleString()} so'm</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(order.status)}">
                            ${this.getStatusText(order.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="adminPanel.viewOrder('${order._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-green-600 hover:text-green-900" onclick="adminPanel.updateOrderStatus('${order._id}', 'confirmed')">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Setup order checkboxes
            document.querySelectorAll('.order-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedOrders.push(e.target.value);
                    } else {
                        this.selectedOrders = this.selectedOrders.filter(id => id !== e.target.value);
                    }
                });
            });
        } catch (error) {
            console.error('Orders yuklashda xatolik:', error);
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products/categories');
            const categories = await response.json();

            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';

            for (const category of categories) {
                const productsResponse = await fetch(`/api/products/category/${category._id}`);
                const products = await productsResponse.json();

                const categoryDiv = document.createElement('div');
                categoryDiv.innerHTML = `
                    <div class="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <span class="text-3xl mr-3">${category.icon || '📦'}</span>
                                <h4 class="text-xl font-bold text-gray-800">${category.nameUz}</h4>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="adminPanel.editCategory('${category._id}')" class="text-blue-600 hover:text-blue-800 p-2">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="adminPanel.deleteCategory('${category._id}')" class="text-red-600 hover:text-red-800 p-2">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p class="text-gray-600 mb-4">${products.length} mahsulot</p>
                        <div class="space-y-2 max-h-40 overflow-y-auto">
                            ${products.map(product => `
                                <div class="bg-white p-3 rounded-lg border border-gray-200">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium text-gray-800">${product.nameUz}</span>
                                        <div class="flex space-x-2">
                                            <button onclick="adminPanel.editProduct('${product._id}')" class="text-blue-600 hover:text-blue-800 text-sm">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="adminPanel.deleteProduct('${product._id}')" class="text-red-600 hover:text-red-800 text-sm">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600 mt-1">
                                        ${product.variants?.map(v => `${v.size}: ${v.price?.toLocaleString()} so'm`).join(', ') || 'Variant yo\'q'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="adminPanel.showAddProductModal('${category._id}')" class="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-plus mr-2"></i>Mahsulot qo'shish
                        </button>
                    </div>
                `;
                grid.appendChild(categoryDiv);
            }
        } catch (error) {
            console.error('Products yuklashda xatolik:', error);
        }
    }

    async loadCustomers() {
        try {
            const response = await fetch('/api/users/role/customer');
            const customers = await response.json();

            const grid = document.getElementById('customersGrid');
            grid.innerHTML = '';

            customers.forEach(customer => {
                const card = document.createElement('div');
                card.innerHTML = `
                    <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-green-600"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-bold text-gray-800">${customer.name}</h4>
                                <p class="text-gray-600">${customer.shopName}</p>
                            </div>
                        </div>
                        <div class="space-y-2 text-sm">
                            <p><strong>Telefon:</strong> ${customer.phone}</p>
                            <p><strong>Qarz:</strong> ${customer.debt?.amount?.toLocaleString() || 0} so'm</p>
                            <p><strong>Holat:</strong> 
                                <span class="${customer.debt?.blocked ? 'text-red-600' : 'text-green-600'}">
                                    ${customer.debt?.blocked ? 'Bloklangan' : 'Faol'}
                                </span>
                            </p>
                        </div>
                        <div class="mt-4 flex space-x-2">
                            <button class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Buyurtmalar
                            </button>
                            <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            console.error('Customers yuklashda xatolik:', error);
        }
    }

    async loadDrivers() {
        try {
            const response = await fetch('/api/users/role/driver');
            const drivers = await response.json();

            const grid = document.getElementById('driversGrid');
            grid.innerHTML = '';

            drivers.forEach(driver => {
                const card = document.createElement('div');
                card.innerHTML = `
                    <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-truck text-orange-600"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-bold text-gray-800">${driver.name}</h4>
                                <p class="text-gray-600">${driver.phone}</p>
                            </div>
                        </div>
                        <div class="space-y-2 text-sm">
                            <p><strong>Transport:</strong> ${driver.driverInfo?.vehicle || 'N/A'}</p>
                            <p><strong>Hudud:</strong> ${driver.driverInfo?.assignedRegion || 'N/A'}</p>
                            <p><strong>Holat:</strong> 
                                <span class="${driver.isActive ? 'text-green-600' : 'text-red-600'}">
                                    ${driver.isActive ? 'Faol' : 'Nofaol'}
                                </span>
                            </p>
                        </div>
                        <div class="mt-4 flex space-x-2">
                            <button class="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                                Buyurtmalar
                            </button>
                            <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            console.error('Drivers yuklashda xatolik:', error);
        }
    }

    async loadAdmins() {
        try {
            const response = await fetch('/api/users/role/admin');
            const admins = await response.json();

            const grid = document.getElementById('adminsGrid');
            grid.innerHTML = '';

            admins.forEach(admin => {
                const card = document.createElement('div');
                card.innerHTML = `
                    <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user-shield text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-bold text-gray-800">${admin.name}</h4>
                                <p class="text-gray-600">Admin</p>
                            </div>
                        </div>
                        <div class="space-y-2 text-sm">
                            <p><strong>Telegram ID:</strong> ${admin.telegramId}</p>
                            <p><strong>Telefon:</strong> ${admin.phone || 'N/A'}</p>
                            <p><strong>Holat:</strong> 
                                <span class="${admin.isActive ? 'text-green-600' : 'text-red-600'}">
                                    ${admin.isActive ? 'Faol' : 'Nofaol'}
                                </span>
                            </p>
                        </div>
                        <div class="mt-4 flex space-x-2">
                            <button class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Batafsil
                            </button>
                            <button class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            console.error('Admins yuklashda xatolik:', error);
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch('/api/admin/statistics');
            const data = await response.json();

            // Region chart
            const regionCtx = document.getElementById('regionChart').getContext('2d');
            new Chart(regionCtx, {
                type: 'doughnut',
                data: {
                    labels: data.salesByRegion?.map(item => item._id || 'Noma\'lum') || [],
                    datasets: [{
                        data: data.salesByRegion?.map(item => item.totalAmount) || [],
                        backgroundColor: [
                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // Products chart
            const productsCtx = document.getElementById('productsChart').getContext('2d');
            new Chart(productsCtx, {
                type: 'bar',
                data: {
                    labels: data.topProducts?.map(item => item._id) || [],
                    datasets: [{
                        label: 'Sotilgan miqdor',
                        data: data.topProducts?.map(item => item.totalSold) || [],
                        backgroundColor: '#3B82F6'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Statistics yuklashda xatolik:', error);
        }
    }

    // Modal functions
    showAssignModal() {
        if (this.selectedOrders.length === 0) {
            alert('Buyurtmalarni tanlang');
            return;
        }
        document.getElementById('assignModal').classList.remove('hidden');
        document.getElementById('assignModal').classList.add('flex');
    }

    hideAssignModal() {
        document.getElementById('assignModal').classList.add('hidden');
        document.getElementById('assignModal').classList.remove('flex');
    }

    showAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.remove('hidden');
        document.getElementById('addCategoryModal').classList.add('flex');
    }

    hideAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.add('hidden');
        document.getElementById('addCategoryModal').classList.remove('flex');
    }

    showAddAdminModal() {
        document.getElementById('addAdminModal').classList.remove('hidden');
        document.getElementById('addAdminModal').classList.add('flex');
    }

    hideAddAdminModal() {
        document.getElementById('addAdminModal').classList.add('hidden');
        document.getElementById('addAdminModal').classList.remove('flex');
    }

    showAddDriverModal() {
        document.getElementById('addDriverModal').classList.remove('hidden');
        document.getElementById('addDriverModal').classList.add('flex');
    }

    hideAddDriverModal() {
        document.getElementById('addDriverModal').classList.add('hidden');
        document.getElementById('addDriverModal').classList.remove('flex');
    }

    showAddProductModal(categoryId = null) {
        this.selectedCategoryId = categoryId;
        document.getElementById('addProductModal').classList.remove('hidden');
        document.getElementById('addProductModal').classList.add('flex');
        
        // Load categories for dropdown
        this.loadCategoriesForProduct();
        
        if (categoryId) {
            document.getElementById('productCategory').value = categoryId;
        }
    }

    hideAddProductModal() {
        document.getElementById('addProductModal').classList.add('hidden');
        document.getElementById('addProductModal').classList.remove('flex');
    }

    async loadCategoriesForProduct() {
        try {
            const response = await fetch('/api/products/categories');
            const categories = await response.json();
            
            const select = document.getElementById('productCategory');
            select.innerHTML = '<option value="">Kategoriyani tanlang</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id;
                option.textContent = category.nameUz;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Categories yuklashda xatolik:', error);
        }
    }

    // Add functions
    async addCategory() {
        const nameUz = document.getElementById('categoryNameUz').value;
        const icon = document.getElementById('categoryIcon').value;

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nameUz,
                    icon
                })
            });

            if (response.ok) {
                alert('Kategoriya qo\'shildi!');
                this.hideAddCategoryModal();
                this.loadProducts();
                document.getElementById('categoryForm').reset();
            }
        } catch (error) {
            console.error('Category qo\'shishda xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    async addAdmin() {
        const telegramId = document.getElementById('adminTelegramId').value;
        const name = document.getElementById('adminName').value;
        const phone = document.getElementById('adminPhone').value;

        try {
            const response = await fetch('/api/users/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegramId,
                    name,
                    phone
                })
            });

            if (response.ok) {
                alert('Admin qo\'shildi!');
                this.hideAddAdminModal();
                this.loadAdmins();
                document.getElementById('adminForm').reset();
            }
        } catch (error) {
            console.error('Admin qo\'shishda xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    async addDriver() {
        const telegramId = document.getElementById('driverTelegramId').value;
        const name = document.getElementById('driverName').value;
        const phone = document.getElementById('driverPhone').value;
        const vehicle = document.getElementById('driverVehicle').value;
        const assignedRegion = document.getElementById('driverRegion').value;

        try {
            const response = await fetch('/api/users/driver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegramId,
                    name,
                    phone,
                    vehicle,
                    assignedRegion
                })
            });

            if (response.ok) {
                alert('Haydovchi qo\'shildi!');
                this.hideAddDriverModal();
                this.loadDrivers();
                document.getElementById('driverForm').reset();
            }
        } catch (error) {
            console.error('Driver qo\'shishda xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    async addProduct() {
        const nameUz = document.getElementById('productNameUz').value;
        const category = document.getElementById('productCategory').value;
        const description = document.getElementById('productDescription').value;
        const image = document.getElementById('productImage').value;
        
        // Variants
        const variants = [];
        const variantRows = document.querySelectorAll('.variant-row');
        variantRows.forEach(row => {
            const size = row.querySelector('.variant-size').value;
            const price = row.querySelector('.variant-price').value;
            const unit = row.querySelector('.variant-unit').value;
            
            if (size && price) {
                variants.push({
                    size,
                    price: parseInt(price),
                    unit,
                    inStock: true
                });
            }
        });

        if (!nameUz || !category || variants.length === 0) {
            alert('Barcha maydonlarni to\'ldiring va kamida bitta variant qo\'shing');
            return;
        }

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nameUz,
                    category,
                    description,
                    image: image || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=300',
                    variants
                })
            });

            if (response.ok) {
                alert('Mahsulot qo\'shildi!');
                this.hideAddProductModal();
                this.loadProducts();
                document.getElementById('productForm').reset();
                this.resetVariants();
            }
        } catch (error) {
            console.error('Product qo\'shishda xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    addVariantRow() {
        const container = document.getElementById('variantsContainer');
        const row = document.createElement('div');
        row.className = 'variant-row flex space-x-2 mb-2';
        row.innerHTML = `
            <input type="text" class="variant-size flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="Hajmi (1L, 500ml)">
            <input type="number" class="variant-price flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="Narxi">
            <select class="variant-unit border border-gray-300 rounded-lg px-3 py-2">
                <option value="dona">Dona</option>
                <option value="blok">Blok</option>
                <option value="kg">Kg</option>
                <option value="litr">Litr</option>
            </select>
            <button type="button" onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-800 px-2">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    }

    resetVariants() {
        const container = document.getElementById('variantsContainer');
        container.innerHTML = '';
        this.addVariantRow();
    }

    async deleteCategory(categoryId) {
        if (confirm('Kategoriyani o\'chirmoqchimisiz?')) {
            try {
                const response = await fetch(`/api/admin/categories/${categoryId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    this.loadProducts();
                }
            } catch (error) {
                console.error('Category o\'chirishda xatolik:', error);
            }
        }
    }

    async deleteProduct(productId) {
        if (confirm('Mahsulotni o\'chirmoqchimisiz?')) {
            try {
                const response = await fetch(`/api/admin/products/${productId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    this.loadProducts();
                }
            } catch (error) {
                console.error('Product o\'chirishda xatolik:', error);
            }
        }
    }

    async editCategory(categoryId) {
        const newName = prompt('Yangi nom kiriting:');
        if (newName) {
            try {
                const response = await fetch(`/api/admin/categories/${categoryId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nameUz: newName })
                });
                if (response.ok) {
                    this.loadProducts();
                }
            } catch (error) {
                console.error('Category yangilashda xatolik:', error);
            }
        }
    }

    async editProduct(productId) {
        const newName = prompt('Yangi nom kiriting:');
        if (newName) {
            try {
                const response = await fetch(`/api/admin/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nameUz: newName })
                });
                if (response.ok) {
                    this.loadProducts();
                }
            } catch (error) {
                console.error('Product yangilashda xatolik:', error);
            }
        }
    }

    selectAllOrders(checked) {
        document.querySelectorAll('.order-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        
        if (checked) {
            this.selectedOrders = Array.from(document.querySelectorAll('.order-checkbox')).map(cb => cb.value);
        } else {
            this.selectedOrders = [];
        }
    }

    async assignOrders() {
        const driverId = document.getElementById('driverSelect').value;
        if (!driverId) {
            alert('Haydovchini tanlang');
            return;
        }

        try {
            const response = await fetch('/api/admin/assign-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId,
                    orderIds: this.selectedOrders
                })
            });

            if (response.ok) {
                alert('Buyurtmalar muvaffaqiyatli tayinlandi');
                this.hideAssignModal();
                this.loadOrders();
                this.selectedOrders = [];
            }
        } catch (error) {
            console.error('Assign orders xatolik:', error);
            alert('Xatolik yuz berdi');
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                this.loadOrders();
            }
        } catch (error) {
            console.error('Update status xatolik:', error);
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

// Initialize admin panel
const adminPanel = new AdminPanel();