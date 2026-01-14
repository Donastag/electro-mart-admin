import axios from 'axios';

// Get the Payload API URL from environment variables
const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'http://localhost:3001';

if (!PAYLOAD_URL) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_API_URL is not set');
}

// Create an Axios instance pre-configured for your Payload API
export const payloadAPI = axios.create({
    baseURL: PAYLOAD_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dashboard statistics types
export interface DashboardStats {
    revenue_today: number;
    revenue_change: number;
    new_orders: number;
    orders_change: number;
    conversion_rate: number;
    conversion_change: number;
    active_customers: number;
    customers_change: number;
}

// Order types
export interface OrderItem {
    product: string | object;
    quantity: number;
    price: number;
    total: number;
}

export interface Order {
    id: string;
    order_number: string;
    customer: string | object;
    items?: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    created_at: string;
    updated_at: string;
}

// Product types
export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    inventory_count: number;
    is_active: boolean;
    tags?: string[];
    category?: string | object;
}

// Customer types
export interface Customer {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    created_at: string;
}

// Analytics types
export interface AnalyticsData {
    date: string;
    revenue: number;
    orders: number;
    visitors: number;
    conversion_rate: number;
    average_order_value: number;
    new_customers: number;
    returning_customers: number;
}

/**
 * Fetch dashboard statistics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const [todayOrders, yesterdayOrders, totalCustomers] = await Promise.all([
            payloadAPI.get(`/orders?where[created_at][gte]=${today}T00:00:00Z&limit=1000`),
            payloadAPI.get(`/orders?where[created_at][gte]=${yesterday}T00:00:00Z&where[created_at][lt]=${today}T00:00:00Z&limit=1000`),
            payloadAPI.get(`/users?where[role][equals]=customer&limit=1000`)
        ]);

        const todayRevenue = todayOrders.data.docs?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
        const yesterdayRevenue = yesterdayOrders.data.docs?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
        
        const todayOrderCount = todayOrders.data.docs?.length || 0;
        const yesterdayOrderCount = yesterdayOrders.data.docs?.length || 0;

        return {
            revenue_today: todayRevenue / 100, // Convert from cents to dollars
            revenue_change: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0,
            new_orders: todayOrderCount,
            orders_change: yesterdayOrderCount > 0 ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100 : 0,
            conversion_rate: 4.8, // TODO: Calculate from analytics
            conversion_change: -0.2,
            active_customers: totalCustomers.data.docs?.length || 0,
            customers_change: 8.0, // TODO: Calculate from user growth
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return mock data as fallback
        return {
            revenue_today: 24580,
            revenue_change: 5.2,
            new_orders: 345,
            orders_change: 15,
            conversion_rate: 4.8,
            conversion_change: -0.2,
            active_customers: 1200,
            customers_change: 8,
        };
    }
};

/**
 * Fetch recent orders
 */
export const fetchRecentOrders = async (): Promise<Order[]> => {
    try {
        const response = await payloadAPI.get('/orders?limit=10&sort=-created_at');
        return response.data.docs?.map((order: any) => ({
            id: order.id,
            order_number: order.order_number,
            customer: typeof order.customer === 'object' ? order.customer : { email: 'Customer' },
            total: order.total / 100, // Convert from cents to dollars
            status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at,
        })) || [];
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        // Return mock data as fallback
        return [
            { 
                id: '1', 
                order_number: '#ORD-1234', 
                customer: { email: 'A. Johnson' }, 
                total: 450.00, 
                status: 'processing', 
                created_at: '2024-01-01T13:02:00Z', 
                updated_at: '2024-01-01T13:02:00Z' 
            },
            { 
                id: '2', 
                order_number: '#ORD-1235', 
                customer: { email: 'B. Smith' }, 
                total: 89.99, 
                status: 'shipped', 
                created_at: '2024-01-01T12:45:00Z', 
                updated_at: '2024-01-01T12:45:00Z' 
            },
            { 
                id: '3', 
                order_number: '#ORD-1236', 
                customer: { email: 'C. Williams' }, 
                total: 12.50, 
                status: 'delivered', 
                created_at: '2024-01-01T11:14:00Z', 
                updated_at: '2024-01-01T11:14:00Z' 
            },
            { 
                id: '4', 
                order_number: '#ORD-1237', 
                customer: { email: 'D. Jones' }, 
                total: 600.00, 
                status: 'pending', 
                created_at: '2024-01-01T09:30:00Z', 
                updated_at: '2024-01-01T09:30:00Z' 
            },
        ];
    }
};

/**
 * Fetch products
 */
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const response = await payloadAPI.get('/products?limit=100&sort=-created_at');
        return response.data.docs?.map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price / 100, // Convert from cents to dollars
            inventory_count: product.inventory_count || 0,
            is_active: product.is_active !== false,
            tags: product.tags || [],
            category: product.category_id,
        })) || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        // Return mock data as fallback
        return [
            { id: '1', name: 'Premium Wireless Headphones', sku: 'HP-001', price: 249.99, inventory_count: 45, is_active: true, tags: ['Audio', 'Wireless'] },
            { id: '2', name: 'Smart Fitness Watch X', sku: 'SW-005', price: 199.00, inventory_count: 12, is_active: true, tags: ['Fitness', 'Smartwatch'] },
            { id: '3', name: 'Portable Bluetooth Speaker', sku: 'BS-010', price: 75.00, inventory_count: 30, is_active: true, tags: ['Audio', 'Portable'] },
            { id: '4', name: 'USB-C Fast Charger', sku: 'CH-003', price: 29.99, inventory_count: 0, is_active: false, tags: ['Needs AI Review'] },
        ];
    }
};

/**
 * Fetch customers
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
    try {
        const response = await payloadAPI.get('/users?where[role][equals]=customer&limit=100&sort=-created_at');
        return response.data.docs?.map((user: any) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            created_at: user.created_at,
        })) || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
};

/**
 * Fetch analytics data
 */
export const fetchAnalytics = async (days: number = 30): Promise<AnalyticsData[]> => {
    try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
        
        const response = await payloadAPI.get(`/analytics?where[date][gte]=${startDate.toISOString().split('T')[0]}&where[date][lte]=${endDate.toISOString().split('T')[0]}&sort=date`);
        return response.data.docs || [];
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return [];
    }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
        await payloadAPI.patch(`/orders/${orderId}`, { status });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
};

/**
 * Create new product
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product | null> => {
    try {
        const response = await payloadAPI.post('/products', {
            ...productData,
            price: Math.round((productData.price || 0) * 100), // Convert to cents
        });
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
};

/**
 * Update product
 */
export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
        const response = await payloadAPI.patch(`/products/${productId}`, {
            ...productData,
            price: productData.price ? Math.round(productData.price * 100) : undefined, // Convert to cents if provided
        });
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
};

/**
 * Delete product
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
        await payloadAPI.delete(`/products/${productId}`);
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
};