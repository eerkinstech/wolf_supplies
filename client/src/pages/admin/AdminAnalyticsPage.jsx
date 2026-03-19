'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchOrders } from '../../redux/slices/orderSlice';


const AdminAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const { orders = [] } = useSelector((state) => state.order);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('today');
  const [minGrossSale, setMinGrossSale] = useState('all');
  const [maxGrossSale, setMaxGrossSale] = useState('all');
  const [minOrders, setMinOrders] = useState('all');
  const [maxOrders, setMaxOrders] = useState('all');
  const [sortColumn, setSortColumn] = useState(null); // 'gross' or 'orders'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    salesByProduct: [],
    bestSellingByCount: [],
    bestSellingByQuantity: [],
    productsByItemsSold: [],
    productsByGrossValue: [],
    productOrderCountByProduct: {},
    variantQtyMap: {},
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantBreakdown, setVariantBreakdown] = useState({});

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
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (products && orders && orders.length > 0) {
      // Filter orders by date range
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

      // Calculate sales data
      const totalSales = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

      // Calculate product sales with variants
      const productSalesMap = {};
      const productOrderCountMap = {};
      const productQuantityMap = {};
      const productVariantsMap = {};

      // Create a map to count orders per product
      const productOrderCountByProduct = {};

      filteredOrders.forEach((order) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item) => {
            const productId = item.product || item._id;
            if (!productOrderCountByProduct[productId]) {
              productOrderCountByProduct[productId] = 0;
            }
            productOrderCountByProduct[productId] += 1;
          });
        }
      });

      filteredOrders.forEach((order) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item) => {
            const productId = item.product || item._id;
            const qty = item.qty || 1;
            const itemPrice = item.price || 0;
            const variant = item.variant || null;

            if (!productSalesMap[productId]) {
              productSalesMap[productId] = {
                name: item.name,
                sales: 0,
                price: itemPrice,
                id: productId,
                variants: []
              };
            }
            if (!productOrderCountMap[productId]) {
              productOrderCountMap[productId] = { name: item.name, count: 0, id: productId, itemsSold: 0 };
            }
            if (!productQuantityMap[productId]) {
              productQuantityMap[productId] = { name: item.name, quantity: 0, id: productId };
            }
            if (!productVariantsMap[productId]) {
              productVariantsMap[productId] = [];
            }

            // Track variants
            if (variant) {
              const variantExists = productVariantsMap[productId].find(v => JSON.stringify(v) === JSON.stringify(variant));
              if (!variantExists) {
                productVariantsMap[productId].push(variant);
              }
            }

            productSalesMap[productId].sales += itemPrice * qty;
            productSalesMap[productId].grossValue = (productSalesMap[productId].sales || 0);
            productOrderCountMap[productId].count += 1;
            productOrderCountMap[productId].itemsSold += qty;
            productQuantityMap[productId].quantity += qty;
          });
        }
      });

      // Enhance with variant info
      Object.keys(productSalesMap).forEach(productId => {
        productSalesMap[productId].variants = productVariantsMap[productId] || [];
      });

      // Sort and get top 8
      const salesByProduct = Object.values(productSalesMap)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 8);

      const bestSellingByCount = Object.values(productOrderCountMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      const bestSellingByQuantity = Object.values(productQuantityMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8);

      // Products sorted by items sold
      const productsByItemsSold = Object.values(productOrderCountMap)
        .sort((a, b) => b.itemsSold - a.itemsSold)
        .slice(0, 10);

      // Products sorted by gross value
      const productsByGrossValue = Object.values(productSalesMap)
        .sort((a, b) => (b.grossValue || 0) - (a.grossValue || 0))
        .slice(0, 10);

      // Create variant breakdown for modal
      // ONLY products with selectedVariants object are considered variant products
      const variantQtyMap = {};
      filteredOrders.forEach((order) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item) => {
            // Extract product ID - handle case where item.product is an object (from populate)
            let productId = null;
            if (typeof item.product === 'object' && item.product?._id) {
              productId = String(item.product._id);
            } else if (typeof item.product === 'string') {
              productId = item.product;
            } else if (item._id) {
              productId = String(item._id);
            }

            // STRICT CHECK: Only products with selectedVariants are variant products
            // Must be an object, not null, not array, have keys, and have at least one meaningful value
            if (
              productId &&
              item.selectedVariants &&
              typeof item.selectedVariants === 'object' &&
              !Array.isArray(item.selectedVariants) &&
              Object.keys(item.selectedVariants).length > 0 &&
              Object.values(item.selectedVariants).some(v => v && String(v).trim() !== '')
            ) {
              const variantKey = JSON.stringify(item.selectedVariants);

              if (!variantQtyMap[productId]) {
                variantQtyMap[productId] = {};
              }
              if (!variantQtyMap[productId][variantKey]) {
                variantQtyMap[productId][variantKey] = {
                  variant: item.selectedVariants,
                  quantity: 0
                };
              }
              variantQtyMap[productId][variantKey].quantity += (item.qty || 1);
            }
          });
        }
      });

      setAnalytics({
        totalSales: totalSales.toFixed(2),
        totalOrders,
        totalProducts: products.length,
        avgOrderValue,
        salesByProduct,
        bestSellingByCount,
        bestSellingByQuantity,
        productsByItemsSold,
        productsByGrossValue,
        filteredOrders,
        productOrderCountByProduct,
        variantQtyMap,
      });
    }
  }, [products, orders, dateFrom, dateTo]);
  return (
    <AdminLayout activeTab="analytics">
      <div className="p-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Analytics Dashboard</h1>
        <p className="mt-4" style={{ color: 'var(--color-text-light)' }}>View sales, revenue, and performance metrics</p>

        {/* Date filter with Presets */}
        <div className="mb-6 rounded-lg p-4 shadow mt-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-sm font-semibold mb-3 px-3 py-1.5 rounded"
            style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
          >
            <i className="fas fa-calendar mr-1 inline"></i> {showDatePicker ? 'Hide' : 'Show'} Date Filter
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
                      {selectedPreset === preset.value && '? '}
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar & Date Inputs */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Sales</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-accent-primary)' }}>
              <span>&pound;</span>{analytics.totalSales}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>All time revenue</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Orders</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>{analytics.totalOrders}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>Complete orders</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Products</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>{analytics.totalProducts}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>In catalog</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Avg. Order Value</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
              <span>&pound;</span>{analytics.avgOrderValue}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>Average per order</p>
          </div>
        </div>

        {/* Orders Table - Full Width */}
        <div className="rounded-lg shadow p-6 mt-8 w-full" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 4v16" />
            </svg>
            <span>Orders Details</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Product Name</th>

                  <th
                    className="text-right py-2 px-3 font-semibold cursor-pointer hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => {
                      if (sortColumn === 'gross') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortColumn('gross');
                        setSortDirection('asc');
                      }
                    }}
                  >
                    Gross Sale{' '}
                    <span style={{ color: sortColumn === 'gross' && sortDirection === 'asc' ? '#000' : '#ccc' }}>&uarr;</span>
                    <span style={{ color: sortColumn === 'gross' && sortDirection === 'desc' ? '#000' : '#ccc' }}>&darr;</span>
                  </th>
                  <th
                    className="text-center py-2 px-3 font-semibold cursor-pointer hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => {
                      if (sortColumn === 'orders') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortColumn('orders');
                        setSortDirection('asc');
                      }
                    }}
                  >
                    Orders{' '}
                    <span style={{ color: sortColumn === 'orders' && sortDirection === 'asc' ? '#000' : '#ccc' }}>&uarr;</span>
                    <span style={{ color: sortColumn === 'orders' && sortDirection === 'desc' ? '#000' : '#ccc' }}>&darr;</span>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Original Price</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Discounted Amount</th>
                </tr>
              </thead>
              <tbody>
                {analytics.filteredOrders && analytics.filteredOrders.length > 0 ? (() => {
                  // Create a map of unique products with aggregated data
                  // Use composite key: productId + productName to treat different names as separate rows
                  const productMap = {};

                  analytics.filteredOrders.forEach((order) => {
                    if (order.orderItems && Array.isArray(order.orderItems)) {
                      order.orderItems.forEach((item) => {
                        // Extract product ID - handle case where item.product is an object (from populate)
                        let productId = null;
                        if (typeof item.product === 'object' && item.product?._id) {
                          productId = String(item.product._id);
                        } else if (typeof item.product === 'string') {
                          productId = item.product;
                        } else if (item._id) {
                          productId = String(item._id);
                        }

                        const productName = item.name || 'Unknown Product';
                        // Create a unique key combining ID and name
                        const compositeKey = `${productId}-${productName}`;

                        if (!productMap[compositeKey]) {
                          productMap[compositeKey] = {
                            id: productId,
                            name: productName,
                            price: item.price || 0,
                            totalQty: 0,
                            totalSale: 0,
                            totalDiscount: 0,
                            orderCount: 0,
                            lastDate: order.createdAt,
                            orderIds: new Set()  // Track unique order IDs
                          };
                        }

                        const qty = item.qty || 1;
                        const lineTotal = (item.price || 0) * qty;
                        const orderItemsTotal = Array.isArray(order.orderItems)
                          ? order.orderItems.reduce((sum, orderItem) => sum + ((orderItem.price || 0) * (orderItem.qty || 1)), 0)
                          : 0;
                        const orderDiscount = Number(order.discountAmount || 0);
                        const lineDiscount = orderItemsTotal > 0
                          ? (orderDiscount * lineTotal) / orderItemsTotal
                          : 0;
                        productMap[compositeKey].totalQty += qty;
                        productMap[compositeKey].totalSale += lineTotal;
                        productMap[compositeKey].totalDiscount += lineDiscount;

                        // Only count this order once (even if product has multiple line items)
                        if (!productMap[compositeKey].orderIds.has(String(order._id))) {
                          productMap[compositeKey].orderIds.add(String(order._id));
                          productMap[compositeKey].orderCount += 1;
                        }

                        // Keep the latest date
                        if (new Date(order.createdAt) > new Date(productMap[compositeKey].lastDate)) {
                          productMap[compositeKey].lastDate = order.createdAt;
                        }
                      });
                    }
                  });

                  // Apply filters
                  const minGrossVal = minGrossSale === 'all' ? 0 : parseFloat(minGrossSale);
                  const maxGrossVal = maxGrossSale === 'all' ? Infinity : parseFloat(maxGrossSale);
                  const minOrdersVal = minOrders === 'all' ? 0 : parseInt(minOrders, 10);
                  const maxOrdersVal = maxOrders === 'all' ? Infinity : parseInt(maxOrders, 10);

                  // Convert to array and sort based on column header click or filter button click
                  let sorted = Object.values(productMap).sort((a, b) => {
                    // If column header sort is active, use that
                    if (sortColumn === 'gross') {
                      const grossA = (a.totalSale || 0) - (a.totalDiscount || 0);
                      const grossB = (b.totalSale || 0) - (b.totalDiscount || 0);
                      return sortDirection === 'asc' ? grossA - grossB : grossB - grossA;
                    }
                    if (sortColumn === 'orders') {
                      return sortDirection === 'asc' ? a.orderCount - b.orderCount : b.orderCount - a.orderCount;
                    }

                    // If min gross sale is active, sort ascending (min to max)
                    if (minGrossSale !== 'all' && maxGrossSale === 'all') {
                      return (a.totalSale - a.totalDiscount) - (b.totalSale - b.totalDiscount);
                    }
                    // If max gross sale is active, sort descending (max to min)
                    if (maxGrossSale !== 'all' && minGrossSale === 'all') {
                      return (b.totalSale - b.totalDiscount) - (a.totalSale - a.totalDiscount);
                    }
                    // If min orders is active, sort ascending
                    if (minOrders !== 'all' && maxOrders === 'all') {
                      return a.orderCount - b.orderCount;
                    }
                    // If max orders is active, sort descending
                    if (maxOrders !== 'all' && minOrders === 'all') {
                      return b.orderCount - a.orderCount;
                    }
                    // Default: sort by gross sale descending
                    return (b.totalSale - b.totalDiscount) - (a.totalSale - a.totalDiscount);
                  });

                  // Render
                  return sorted
                    .filter((product) => {
                      const gross = Math.max(0, (parseFloat(product.totalSale) || 0) - (parseFloat(product.totalDiscount) || 0));
                      const orders = parseInt(product.orderCount, 10) || 0;
                      return gross >= minGrossVal && gross <= maxGrossVal && orders >= minOrdersVal && orders <= maxOrdersVal;
                    })
                    .map((product) => (
                      <tr key={`${product.id}-${product.name}`} style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                        <td
                          className="py-2 px-3"
                          style={{
                            color: 'var(--color-accent-primary)',
                            cursor: (analytics.variantQtyMap[product.id] && Object.values(analytics.variantQtyMap[product.id]).length > 0) ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            const variants = analytics.variantQtyMap[product.id];
                            const variantsList = variants ? Object.values(variants) : [];

                            // STRICT validation: Only open modal if variants are valid
                            const isValidVariantProduct =
                              variantsList &&
                              variantsList.length > 0 &&
                              variantsList.every(v => v && typeof v.quantity === 'number' && v.quantity > 0);

                            if (isValidVariantProduct) {
                              setSelectedProduct({ id: product.id, name: product.name });
                              setVariantBreakdown(variants || {});
                            } else {
                              // Reset if no valid variants
                              setSelectedProduct(null);
                              setVariantBreakdown({});
                            }
                          }}
                        >
                          <span className={(analytics.variantQtyMap[product.id] && Object.values(analytics.variantQtyMap[product.id]).length > 0) ? 'font-semibold hover:underline' : 'font-semibold'}>
                            {product.name}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-right font-bold" style={{ color: '#10b981' }}>
                          <span>&pound;</span>{Math.max(0, (product.totalSale || 0) - (product.totalDiscount || 0)).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
                          {product.orderCount}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          <span>&pound;</span>{(product.totalSale || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold" style={{ color: '#dc2626' }}>
                          -<span>&pound;</span>{(product.totalDiscount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ));
                                })() : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center" style={{ color: 'var(--color-text-light)' }}>
                      No orders found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variant Modal - Only show if product has variants */}
        {selectedProduct && analytics.variantQtyMap && analytics.variantQtyMap[selectedProduct.id] && Object.keys(analytics.variantQtyMap[selectedProduct.id]).length > 0 && variantBreakdown && Object.keys(variantBreakdown).length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedProduct.name} - Variants
                </h2>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setVariantBreakdown({});
                  }}
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-light)' }}
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.values(variantBreakdown).length > 0 ? (
                  Object.values(variantBreakdown).map((item, idx) => {
                    const variantDisplay = typeof item.variant === 'object'
                      ? Object.entries(item.variant)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                      : item.variant;

                    return (
                      <div key={idx} className="flex justify-between items-center p-3 rounded border" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {variantDisplay || 'Default'}
                        </span>
                        <span className="font-bold px-3 py-1 rounded" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>
                          {item.quantity}x
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--color-text-light)' }}>No variant data available</p>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setVariantBreakdown({});
                }}
                className="w-full mt-4 py-2 rounded font-semibold text-white"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
