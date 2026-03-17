'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { fetchOrders } from '../../redux/slices/orderSlice';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('today');
  const [filterMode, setFilterMode] = useState('fixed'); // 'fixed' or 'rolling'
  const fetchedRef = React.useRef(false); // Prevent multiple fetch calls
  const { products } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const orderState = useSelector((state) => state.order);
  const orders = Array.isArray(orderState?.orders) ? orderState.orders : Array.isArray(orderState) ? orderState : [];

  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 30 minutes', value: 'last30m' },
    { label: 'Last 12 hours', value: 'last12h' },
    { label: 'Last 7 days', value: 'last7d' },
    { label: 'Last 30 days', value: 'last30d' },
    { label: 'Last 90 days', value: 'last90d' },
    { label: 'Last 365 days', value: 'last365d' },
    { label: 'Last 12 months', value: 'last12m' },
    { label: 'Last week', value: 'lastweek' },
    { label: 'Last month', value: 'lastmonth' },
  ];

  // Initialize with today's date on component mount
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setDateFrom(todayString);
    setDateTo(todayString);
  }, []);

  const handlePresetClick = (presetValue) => {
    setSelectedPreset(presetValue);
    const now = new Date();
    let from, to;

    switch (presetValue) {
      case 'today':
        from = new Date(now);
        from.setHours(0, 0, 0, 0);
        to = new Date(now);
        to.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        from = new Date(now);
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to = new Date(from);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last30m':
        from = new Date(now.getTime() - 30 * 60000);
        to = new Date(now);
        break;
      case 'last12h':
        from = new Date(now.getTime() - 12 * 60 * 60000);
        to = new Date(now);
        break;
      case 'last7d':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        to = new Date(now);
        break;
      case 'last30d':
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        to = new Date(now);
        break;
      case 'last90d':
        from = new Date(now);
        from.setDate(from.getDate() - 90);
        to = new Date(now);
        break;
      case 'last365d':
        from = new Date(now);
        from.setDate(from.getDate() - 365);
        to = new Date(now);
        break;
      case 'lastweek':
        from = new Date(now);
        from.setDate(from.getDate() - from.getDay() - 7);
        to = new Date(from);
        to.setDate(to.getDate() + 6);
        break;
      case 'lastmonth':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last12m':
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
        to = new Date(now);
        break;
      default:
        from = new Date(now);
        from.setHours(0, 0, 0, 0);
        to = new Date(now);
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(fetchProducts());
      dispatch(fetchCategories());
      dispatch(fetchOrders());
    }
  }, [dispatch]);

  // Calculate stats using useMemo to prevent infinite loops
  const calculatedStats = useMemo(() => {
    if (!products) return { products: 0, categories: 0, totalValue: 0, orders: 0, revenue: 0 };

    // Inventory value calculation
    const totalValue = products.reduce((sum, p) => {
      if (p.variantCombinations && p.variantCombinations.length > 0) {
        const variantsSum = p.variantCombinations.reduce((vsum, v) => {
          const price = (v && v.price) ? v.price : (p.price || 0);
          return vsum + (price || 0);
        }, 0);
        return sum + variantsSum;
      }
      const price = p.price || 0;
      return sum + (price || 0);
    }, 0);

    const toYMD = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      if (isNaN(dt)) return null;
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const startY = toYMD(dateFrom);
    const endY = toYMD(dateTo);

    const filteredOrders = (orders || []).filter((o) => {
      if (!startY && !endY) return true;
      const createdY = toYMD(o.createdAt);
      if (!createdY) return false;
      if (startY && endY) return createdY >= startY && createdY <= endY;
      if (startY) return createdY >= startY;
      if (endY) return createdY <= endY;
      return true;
    });

    const totalRevenue = (filteredOrders || []).reduce((r, o) => r + (o.totalPrice || 0), 0);

    return {
      products: products.length,
      categories: categories?.length || 0,
      totalValue: totalValue.toFixed(2),
      orders: (filteredOrders || []).length,
      revenue: totalRevenue.toFixed(2),
    };
  }, [products, categories, orders, dateFrom, dateTo]);

  const StatCard = ({ icon, label, value, trend, trendUp }) => (
    <div className="rounded-lg shadow p-5 hover:shadow-lg transition hover:scale-105 flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
      <div className="flex justify-center mb-2">
        <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
          <i className={`${icon} text-2xl`} style={{ color: 'white' }}></i>
        </div>
      </div>
      <div className="text-center flex-1 flex flex-col justify-center">
        <p className="text-xs font-semibold opacity-70 mb-1" style={{ color: 'var(--color-text-light)' }}>{label}</p>
        <p className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>{value}</p>
        {trend && (
          <p className={`text-xs font-medium flex items-center justify-center gap-1`} style={{ color: trendUp ? '#22c55e' : '#dc2626' }}>
            {trendUp ? <i className="fas fa-arrow-up" style={{ fontSize: '10px' }}></i> : <i className="fas fa-arrow-down" style={{ fontSize: '10px' }}></i>}
            <span>{trend}</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout activeTab="dashboard">
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg-section)' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Welcome back! Here's your store overview.</p>
        </div>

        {/* Date filter with Presets */}
        <div className="mb-6 rounded-lg p-4 shadow" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-sm font-semibold px-3 py-1.5 rounded"
            style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
          >
            <i className="fas fa-calendar mr-1"></i> {showDatePicker ? 'Hide' : 'Show'} Date Filter
          </button>

          {showDatePicker && (
            <div className="flex gap-4 mt-4">
              {/* Preset Options */}
              <div className="w-48 border-r" style={{ borderColor: 'var(--color-border-light)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-light)' }}>QUICK SELECT</div>
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset.value)}
                      className="w-full text-left text-xs py-1.5 px-2 rounded transition"
                      style={{
                        backgroundColor: selectedPreset === preset.value ? 'var(--color-accent-primary)' : 'transparent',
                        color: selectedPreset === preset.value ? 'white' : 'var(--color-text-primary)',
                      }}
                    >
                      {selectedPreset === preset.value && '✓ '}
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Mode & Calendar */}
              <div className="flex-1">
                <div className="flex gap-4 mb-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-light)' }}>From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded"
                      style={{ borderColor: 'var(--color-border-light)', borderWidth: '1px', backgroundColor: 'var(--color-bg-section)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-light)' }}>To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded"
                      style={{ borderColor: 'var(--color-border-light)', borderWidth: '1px', backgroundColor: 'var(--color-bg-section)' }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="includeCurrent" className="w-3 h-3" defaultChecked />
                  <label htmlFor="includeCurrent" className="text-xs" style={{ color: 'var(--color-text-light)' }}>Include current period</label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setDateFrom('');
                      setDateTo('');
                      setSelectedPreset('');
                    }}
                    className="px-3 py-1 text-xs rounded font-semibold"
                    style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 text-xs rounded font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
          <StatCard
            icon="fas fa-box"
            label="Products"
            value={calculatedStats.products}
            trend="Active"
            trendUp={true}
          />
          <StatCard
            icon="fas fa-shopping-cart"
            label="Orders"
            value={calculatedStats.orders}
            trend="Total"
            trendUp={false}
          />
          <StatCard
            icon="fas fa-chart-line"
            label="Total Sale"
            value={`£${calculatedStats.revenue}`}
            trend="Gross"
            trendUp={true}
          />
          <StatCard
            icon="fas fa-users"
            label="System"
            value="Online"
            trend="Active"
            trendUp={true}
          />
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6" style={{ backgroundColor: 'var(--color-bg-section)' }}>
        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-lg shadow p-5" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/admin/products')}
              className="text-white rounded h-20 text-xs font-semibold   flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <i className="fas fa-box text-2xl mb-1" style={{ display: 'block' }}></i>
              <span className="text-xs">Products</span>
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-white rounded h-20 text-xs font-semibold   flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <i className="fas fa-shopping-cart text-2xl mb-1" style={{ display: 'block' }}></i>
              <span className="text-xs">Orders</span>
            </button>
            <button
              onClick={() => navigate('/admin/categories')}
              className="text-white rounded h-20 text-xs font-semibold   flex flex-col items-center justify-center hover:shadow-md hover:scale-105 transition"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <i className="fas fa-tags text-2xl mb-1" style={{ display: 'block' }}></i>
              <span className="text-xs">Categories</span>
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="text-white rounded text-xs font-semibold   flex flex-col items-center justify-center h-20 hover:shadow-md hover:scale-105 transition"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <i className="fas fa-chart-bar text-2xl mb-1" style={{ display: 'block' }}></i>
              <span className="text-xs">Analytics</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-lg shadow p-5" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Status</h2>
          <div className="space-y-2">
            {[
              { label: 'Database', status: 'Online', icon: '🗄️' },
              { label: 'API', status: 'Online', icon: '⚙️' },
              { label: 'Backend', status: 'Running', icon: '🖥️' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-section)' }}>
                <span>{item.icon} {item.label}</span>
                <span className="font-semibold" style={{ color: '#22c55e' }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
};
export default AdminDashboardPage;