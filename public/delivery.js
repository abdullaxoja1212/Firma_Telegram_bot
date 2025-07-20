// Delivery Panel JavaScript
class DeliveryPanel {
    constructor() {
        this.currentTab = 'orders';
        this.userId = new URLSearchParams(window.location.search).get('userId');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.loadDriverInfo();
        this.loadOrders();
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
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('uz-UZ');
        document.getElementById('currentTime').textContent = timeString;
    }

    async loadDriverInfo() {
        try {
            const response = await fetch(`/api/users/${this.userId}`);
            const driver = await response.json();
            
            document.getElementById('driverName').textContent = driver.name || 'Haydovchi';
        } catch (error) {
            console.error('Driver info yuklashda xatolik:', error);
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'border-b-3', 'border-orange-600', 'text-orange-600');
        });

        // Show selected tab
        document.getElementById(tabName).classList.remove('hidden');

        // Add active class to selected nav button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('active', 'border-b-3', 'border-orange-600', 'text-orange-600');

        this.currentTab = tabName;

        // Load tab content
        switch (tabName) {
            case 'orders':
                this.loadOrders();
                break;
            case 'map':
                this.loadMap();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`/api/orders/driver/${this.userId}`);
            const orders = await response.json();

            // Separate orders by status
            const assigned = orders.filter(order => order.deliveryInfo.status === 'assigned');
            const inProgress = orders.filter(order => order.deliveryInfo.status === 'delivering');
            const completed = orders.filter(order => order.deliveryInfo.status === 'delivered');

            this.renderOrdersList('assignedOrders', assigned, 'assigned');
            this.renderOrdersList('inProgressOrders', inProgress, 'delivering');
            this.renderOrdersList('completedOrders', completed, 'delivered');
        } catch (error) {
            console.error('Orders yuklashda xatolik:', error);
        }
    }

    renderOrdersList(containerId, orders, status) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Buyurtmalar yo\'q</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'bg-gray-50 p-4 rounded-lg border';
            orderCard.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold">${order.orderNumber}</h4>
                    <span class="text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                    <i class="fas fa-user mr-1"></i>${order.customer.name}
                </p>
                <p class="text-sm text-gray-600 mb-2">
                    <i class="fas fa-store mr-1"></i>${order.customer.shopName}
                </p>
                <p class="text-sm text-gray-600 mb-3">
                    <i class="fas fa-map-marker-alt mr-1"></i>${order.deliveryInfo.address}
                </p>
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-green-600">${order.totalAmount.toLocaleString()} so'm</span>
                    ${this.getActionButton(order._id, status)}
                </div>
            `;
            container.appendChild(orderCard);
        });
    }

    getActionButton(orderId, status) {
        switch (status) {
            case 'assigned':
                return `<button onclick="deliveryPanel.startDelivery('${orderId}')" 
                               class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            <i class="fas fa-play mr-1"></i>Boshlash
                        </button>`;
            case 'delivering':
                return `<button onclick="deliveryPanel.completeDelivery('${orderId}')" 
                               class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            <i class="fas fa-check mr-1"></i>Yakunlash
                        </button>`;
            case 'delivered':
                return `<span class="text-green-600 text-sm">
                            <i class="fas fa-check-circle mr-1"></i>Yetkazilgan
                        </span>`;
            default:
                return '';
        }
    }

    async startDelivery(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deliveryStatus: 'delivering'
                })
            });

            if (response.ok) {
                this.loadOrders();
            }
        } catch (error) {
            console.error('Start delivery xatolik:', error);
        }
    }

    async completeDelivery(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'delivered',
                    deliveryStatus: 'delivered'
                })
            });

            if (response.ok) {
                this.loadOrders();
                this.loadStatistics();
            }
        } catch (error) {
            console.error('Complete delivery xatolik:', error);
        }
    }

    loadMap() {
        // Simple map placeholder
        const mapContainer = document.getElementById('deliveryMap');
        mapContainer.innerHTML = `
            <div class="text-center">
                <i class="fas fa-map text-6xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">Xarita integratsiyasi</p>
                <p class="text-sm text-gray-500">Google Maps yoki boshqa xarita xizmati</p>
            </div>
        `;
    }

    async loadStatistics() {
        try {
            const response = await fetch(`/api/drivers/${this.userId}/statistics`);
            const stats = await response.json();

            document.getElementById('todayDeliveries').textContent = stats.todayDeliveries || 0;
            document.getElementById('completedDeliveries').textContent = stats.completedDeliveries || 0;
            document.getElementById('pendingDeliveries').textContent = stats.pendingDeliveries || 0;
            document.getElementById('totalDistance').textContent = stats.totalDistance || 0;
        } catch (error) {
            console.error('Statistics yuklashda xatolik:', error);
        }
    }
}

// Initialize delivery panel
const deliveryPanel = new DeliveryPanel();