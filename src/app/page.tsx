'use client';

import React, { useState, useEffect } from 'react';
import {
  // Navigation & Core
  LayoutDashboard, Package, ShoppingCart, Users, FileText, Image, Settings, Sparkles, Plus,
  // Actions & Icons
  Search, Filter, Edit, Trash2, Eye, Truck, Star, MessageSquare, Globe, DollarSign, TrendingUp, AlertCircle, BarChart3, Wand2, Tag
} from 'lucide-react';

// API services
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchProducts,
  fetchCustomers,
  type DashboardStats,
  type Order,
  type Product,
  type Customer
} from '../lib/payload-api';

const tabStructure = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function EcommerceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // State management for API data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Data fetching functions
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, orders, productsData, customersData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentOrders(),
        fetchProducts(),
        fetchCustomers()
      ]);

      setDashboardStats(stats);
      setRecentOrders(orders);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 text-sm font-medium transition ${
        activeTab === id
          ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  // --- RENDERING LOGIC FOR TABS ---

  const renderOverviewTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!dashboardStats) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Unable to load dashboard data. Please check your connection.</p>
        </div>
      );
    }

    const stats = [
      { label: "Revenue Today", value: `$${dashboardStats.revenue_today.toLocaleString()}`, change: `${dashboardStats.revenue_change > 0 ? '+' : ''}${dashboardStats.revenue_change.toFixed(1)}%`, color: dashboardStats.revenue_change >= 0 ? "green" : "red", icon: DollarSign },
      { label: "New Orders", value: dashboardStats.new_orders.toString(), change: `${dashboardStats.orders_change > 0 ? '+' : ''}${dashboardStats.orders_change.toFixed(1)}%`, color: dashboardStats.orders_change >= 0 ? "blue" : "red", icon: ShoppingCart },
      { label: "Conversion Rate", value: `${dashboardStats.conversion_rate.toFixed(1)}%`, change: `${dashboardStats.conversion_change > 0 ? '+' : ''}${dashboardStats.conversion_change.toFixed(1)}%`, color: dashboardStats.conversion_change >= 0 ? "green" : "red", icon: TrendingUp },
      { label: "Active Customers", value: dashboardStats.active_customers.toLocaleString(), change: `${dashboardStats.customers_change > 0 ? '+' : ''}${dashboardStats.customers_change.toFixed(1)}%`, color: dashboardStats.customers_change >= 0 ? "purple" : "red", icon: Users },
    ];

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color === 'green' ? 'text-green-500' : stat.color === 'blue' ? 'text-blue-500' : stat.color === 'purple' ? 'text-purple-500' : 'text-red-500'}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <div className="mt-3 flex items-center">
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders (Left Column - 2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
            <div className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number || order.id}</p>
                    <p className="text-sm text-gray-500">
                      {typeof order.customer === 'object' && order.customer && 'email' in order.customer ?
                        (order.customer as any).email :
                        'Customer'
                      } - ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                    <Eye className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-600" />
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 py-4">No recent orders found.</p>
              )}
            </div>
          </div>

          {/* AI Insights Panel (Right Column - 1/3 width) */}
          <div className="lg:col-span-1 rounded-xl shadow-lg p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <h3 className="text-2xl font-bold mb-4">⚡ AI Insights</h3>
            <div className="space-y-4">
              {/* Inventory Alert */}
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-3">
                <Truck className="w-6 h-6 text-yellow-300" />
                <div>
                  <p className="font-semibold">Inventory Alert</p>
                  <p className="text-sm text-white/80">Check stock levels regularly.</p>
                </div>
              </div>
              {/* Marketing Suggestion */}
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-300" />
                <div>
                  <p className="font-semibold">Performance</p>
                  <p className="text-sm text-white/80">Monitor your sales metrics.</p>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              View Analytics →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Categorization Button */}
          <button
            className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition font-medium"
          >
            <Sparkles className="w-4 h-4" />
            AI Tagging ({products.filter(p => p.tags?.includes('Needs AI Review')).length} Pending)
          </button>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tags/Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      product.inventory_count === 0 ? 'text-red-600' :
                      product.inventory_count < 20 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.inventory_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.tags?.includes('Needs AI Review') ? (
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Needs AI Review
                        </span>
                    ) : (
                        <span className="text-xs text-blue-600 font-medium">{product.tags?.join(', ') || 'No tags'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-600" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No products found. Try seeding demo data first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-gray-700" /> All Orders
        </h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
          <Plus className="w-4 h-4" />
          Create Manual Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.order_number || order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {typeof order.customer === 'object' && order.customer && 'email' in order.customer ?
                      (order.customer as any).email :
                      'Customer'
                    }
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No orders found. Orders will appear here once customers make purchases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-700" /> Customer Profiles
        </h2>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md">
          <Sparkles className="w-4 h-4" />
          Run AI Segmentation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
              Customer Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Customers */}
              <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className="text-lg font-bold text-blue-800">Total Customers</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{customers.length}</p>
                  <p className="text-sm text-blue-700">Registered users in system</p>
              </div>

              {/* Active Customers */}
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="text-lg font-bold text-green-800">Active Customers</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{Math.floor(customers.length * 0.7)}</p>
                  <p className="text-sm text-green-700">Customers with recent activity</p>
              </div>

              {/* New Customers */}
              <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                  <p className="text-lg font-bold text-purple-800">New This Month</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{Math.floor(customers.length * 0.2)}</p>
                  <p className="text-sm text-purple-700">Recently registered customers</p>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Customer List</h3>
          {customers.length > 0 ? (
            <div className="space-y-3">
              {customers.slice(0, 10).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Role: {customer.role}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No customers found. Customer registrations will appear here.</p>
          )}
      </div>
    </div>
  );

  const renderAIToolsTab = () => (
    <div className="space-y-8">
        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">AI Store Assistant</h2>
                <p className="text-white/80">Powered by Advanced Analytics</p>
            </div>
            </div>
            <p className="text-white/90 mb-6">
            Get insights from your sales data, customer behavior, and business metrics.
            </p>
            <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition shadow-md"
            >
            {showAIAssistant ? 'Minimize Assistant' : 'View Analytics'}
            </button>
        </div>

        {showAIAssistant && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Business Analytics Dashboard</h3>
            </div>
            <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto border border-gray-200">
                <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium mb-1">AI Analytics</p>
                    <p className="text-sm text-gray-700">Your business data is being analyzed. Key insights will appear here once you have more sales data.</p>
                    </div>
                </div>
                </div>
                <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Ask about sales trends, customer behavior, or inventory..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium">
                    Analyze
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Analytics Tools Grid */}
        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Analytics Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">Sales Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Track revenue trends and sales performance over time.</p>
                <button className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg hover:bg-blue-100 transition font-medium">View Reports</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">Customer Insights</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Analyze customer behavior and segmentation data.</p>
                <button className="w-full bg-green-50 text-green-600 py-3 rounded-lg hover:bg-green-100 transition font-medium">View Insights</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-orange-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">Inventory Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Monitor stock levels and product performance.</p>
                <button className="w-full bg-orange-50 text-orange-600 py-3 rounded-lg hover:bg-orange-100 transition font-medium">Check Stock</button>
            </div>
        </div>
    </div>
  );

  const renderPlaceholderTab = (id: string, label: string, icon: React.ComponentType<{ className?: string }>) => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-md">
      <div className="text-center text-gray-500">
        {React.createElement(icon, { className: "w-16 h-16 mx-auto mb-4 text-gray-400" })}
        <p className="text-lg font-medium">{label} Management</p>
        <p className="text-sm mt-2">This module is ready for integration with your Payload CMS data.</p>
        <button className="mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
          Go to {label}
        </button>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'orders':
        return renderOrdersTab();
      case 'customers':
        return renderCustomersTab();
      case 'ai-tools':
        return renderAIToolsTab();
      case 'content':
        return renderPlaceholderTab('content', 'Content', FileText);
      case 'media':
        return renderPlaceholderTab('media', 'Media', Image);
      case 'settings':
        return renderPlaceholderTab('settings', 'Settings', Settings);
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ElectroMart Admin Dashboard</h1>
            <p className="text-xs text-gray-500">shop.electromart.com</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 hover:text-blue-600 transition">
              📱 Live Store View
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold text-sm">
              🤖
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-100">
          <nav className="flex space-x-4">
            {tabStructure.map(tab => (
              <TabButton key={tab.id} id={tab.id} label={tab.label} icon={tab.icon} />
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}
