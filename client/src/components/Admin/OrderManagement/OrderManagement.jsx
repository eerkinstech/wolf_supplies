import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

// Helper to get absolute image URL - handles strings and objects
const getImgSrc = (img) => {
  if (!img) return '';

  // Handle string URLs
  if (typeof img === 'string') {
    if (!img.trim()) return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  }

  // Handle image objects (from Cloudinary or similar)
  if (typeof img === 'object') {
    const url = img.url || img.secure_url || img.public_url || img.path || img.src || '';
    if (!url) return '';
    if (typeof url === 'string') {
      return url.startsWith('http') ? url : `${API}${url}`;
    }
  }

  return '';
};

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.order);
  const [localOrders, setLocalOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [remarksText, setRemarksText] = useState('');
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [editingBilling, setEditingBilling] = useState(false);
  const [contactForm, setContactForm] = useState({});
  const [shippingForm, setShippingForm] = useState({});
  const [billingForm, setBillingForm] = useState({});
  const [filterTab, setFilterTab] = useState('all'); // all, fulfilled, unfulfilled, shipped, delivered, refunded
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('[OrderManagement] Mounting - dispatching fetchOrders');
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const list = Array.isArray(orders) ? orders : [];
    console.log('[OrderManagement] Orders from Redux:', orders);
    console.log('[OrderManagement] localOrders set to:', list);
    setLocalOrders(list);
    // remove any selected ids that no longer exist
    setSelectedIds(prev => prev.filter(id => list.some(o => o._id === id)));
    // update selectAll flag based on current selections
    setSelectAll(prevSelected => list.length > 0 && prevSelected.length === list.length);
  }, [orders]);

  // Filter orders based on selected tab
  const getFilteredOrders = () => {
    let filtered = Array.isArray(localOrders) ? localOrders : [];
    console.log('[getFilteredOrders] Input localOrders:', localOrders);
    console.log('[getFilteredOrders] Started with', filtered.length, 'orders');

    // Apply tab filter
    if (filterTab === 'all') {
      filtered = filtered;
    } else if (filterTab === 'fulfilled') {
      filtered = filtered.filter(o => o.fulfillmentStatus === 'fulfilled');
    } else if (filterTab === 'unfulfilled') {
      filtered = filtered.filter(o => o.fulfillmentStatus === 'unfulfilled');
    } else if (filterTab === 'shipped') {
      filtered = filtered.filter(o => o.deliveryStatus === 'shipped');
    } else if (filterTab === 'delivered') {
      filtered = filtered.filter(o => o.deliveryStatus === 'delivered');
    } else if (filterTab === 'refunded') {
      filtered = filtered.filter(o => o.deliveryStatus === 'refunded');
    }

    console.log('[getFilteredOrders] After tab filter:', filtered.length, 'orders');

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(o => {
        const displayId = o.orderId || `ORD-${new Date(o.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${o._id?.slice(-6)}`;
        const totalPrice = (o.totalPrice ?? o.totalAmount ?? 0).toString();

        return (
          displayId.toLowerCase().includes(query) ||
          totalPrice.includes(query) ||
          o._id.toLowerCase().includes(query)
        );
      });
    }

    console.log('[getFilteredOrders] Final result:', filtered.length, 'orders');
    return filtered;
  };

  let filteredOrders = getFilteredOrders();
  if (!Array.isArray(filteredOrders)) filteredOrders = [];

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePaymentToggle = async (orderId, makePaid) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid: makePaid, paidAt: makePaid ? Date.now() : null }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      toast.success(`Payment marked as ${makePaid ? 'Paid' : 'Unpaid'}`);
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFulfilledToggle = async (orderId, fulfilled) => {
    try {
      const token = localStorage.getItem('token');
      const fulfillmentStatus = fulfilled ? 'fulfilled' : 'unfulfilled';
      const response = await fetch(`${API}/api/orders/${orderId}/fulfillment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fulfillmentStatus }),
      });
      if (!response.ok) throw new Error('Failed to update fulfillment status');
      toast.success(`Order marked as ${fulfillmentStatus}`);
      setModalOrder((prev) => (
        prev && prev._id === orderId
          ? { ...prev, fulfillmentStatus }
          : prev
      ));
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeliveryUpdate = async (orderId, deliveryStatus) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/api/orders/${orderId}/delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryStatus }),
      });

      if (!res.ok) throw new Error('Failed to update delivery status');

      const statusMessage = {
        '': 'Status cleared',
        'shipped': 'Order marked as shipped',
        'delivered': 'Order marked as delivered',
        'refunded': 'Order marked as refunded'
      };

      toast.success(statusMessage[deliveryStatus] || 'Status updated');
      setModalOrder((prev) => (
        prev && prev._id === orderId
          ? { ...prev, deliveryStatus }
          : prev
      ));
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-gray-200 text-gray-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <i className="fas fa-spinner animate-spin text-4xl text-gray-700"></i>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Filter Tabs */}
          <div className="px-6 py-4 bg-white border-b flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterTab('fulfilled')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'fulfilled'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              Fulfilled
            </button>
            <button
              onClick={() => setFilterTab('unfulfilled')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'unfulfilled'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              Unfulfilled
            </button>
            <button
              onClick={() => setFilterTab('shipped')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'shipped'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setFilterTab('delivered')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'delivered'
                ? 'bg-[var(--color-accent-primary)] text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setFilterTab('refunded')}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${filterTab === 'refunded'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              Refunded
            </button>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center gap-4 flex-wrap">
            <h3 className="font-semibold text-gray-900">Orders ({filteredOrders.length})</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search by Order ID or Price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ minWidth: '250px' }}
              />
              <button
                onClick={() => dispatch(fetchOrders())}
                className="text-gray-700 hover:text-indigo-800 flex items-center gap-2"
                title="Refresh orders"
              >
                <i className="fas fa-sync"></i> Refresh
              </button>
              <button
                onClick={async () => {
                  // bulk delete action
                  if (selectedIds.length === 0) return toast('No orders selected');
                  if (!confirm('Delete selected orders that are fulfilled and delivered? This cannot be undone.')) return;
                  setBulkLoading(true);
                  try {
                    const token = localStorage.getItem('token');
                    // delete any selected orders (no restriction)
                    const toDelete = localOrders.filter(o => selectedIds.includes(o._id));
                    if (toDelete.length === 0) {
                      toast('No selected orders to delete');
                      setBulkLoading(false);
                      return;
                    }
                    await Promise.all(toDelete.map(o => fetch(`${API}/api/orders/${o._id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    })));
                    toast.success(`Deleted ${toDelete.length} orders`);
                    setSelectedIds([]);
                    setSelectAll(false);
                    dispatch(fetchOrders());
                  } catch (err) {
                    toast.error('Bulk delete failed');
                  } finally { setBulkLoading(false); }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2"
                title="Delete selected fulfilled+delivered"
              >
                {bulkLoading ? <i className="fas fa-spinner animate-spin"></i> : 'Delete Selected'}
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  <input type="checkbox" checked={selectAll} onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectAll(checked);
                    setSelectedIds(checked ? (Array.isArray(filteredOrders) ? filteredOrders.map(o => o._id) : []) : []);
                  }} />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order / Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Coupon</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fulfilment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delivery Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const displayId = order.orderId || `ORD-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${order._id?.slice(-6)}`;
                  const shortDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
                  const fullDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';

                  const total = order.totalPrice ?? order.totalAmount ?? 0;
                  const fulfilled = order.fulfillmentStatus === 'fulfilled';
                  // Delivery status: single status field
                  const deliveryStatus = order.deliveryStatus || '';

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition duration-300">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(order._id)} onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds(prev => checked ? [...prev, order._id] : prev.filter(id => id !== order._id));
                          if (!checked) setSelectAll(false);
                        }} />
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-900 text-sm">{displayId} <br />
                        {fullDate} </td>
                      <td className="px-4 py-4 text-gray-700 text-sm">
                        {order.couponCode ? (
                          <div>
                            <span className="font-semibold">{order.couponCode}</span>
                            <br />
                            <span className="text-green-600">-£{(order.discountAmount || 0).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-bold">£{Number(total).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleFulfilledToggle(order._id, !fulfilled)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${fulfilled ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}
                          title={fulfilled ? 'Fulfilled - click to mark unfulfilled' : 'Unfulfilled - click to mark fulfilled'}
                        >
                          {fulfilled ? 'Fulfilled' : 'Unfulfilled'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={deliveryStatus}
                          onChange={(e) => handleDeliveryUpdate(order._id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">No Status</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModalOrder(order)} className="px-3 py-1 bg-gray-800 text-white rounded text-sm"> <i className="fas fa-file"></i> </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Order detail modal */}
      {modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white max-w-6xl w-full rounded-lg shadow-2xl overflow-auto max-h-[90vh] grid grid-cols-1 md:grid-cols-3 gap-0" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
            {/* Main Content Block - 2 columns */}
            <div className="md:col-span-2 flex flex-col overflow-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>
                    Order {modalOrder.orderId || modalOrder._id}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>
                    {new Date(modalOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => {
                  setModalOrder(null);
                  setRemarksText('');
                  setEditingRemarkId(null);
                  setEditingContact(false);
                  setEditingShipping(false);
                  setEditingBilling(false);
                }} className="px-4 py-2 rounded font-semibold transition-all hover:opacity-75" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', color: 'var(--color-text-primary, #000000)' }}>
                  Close
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-auto flex-1">
                {/* Contact Details Section */}
                <div className="p-6 rounded-lg border-2" style={{
                  backgroundColor: 'var(--color-bg-section, #e5e5e5)',
                  borderColor: 'var(--color-border-light, #e5e5e5)'
                }}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>Contact Details</h4>
                    {!editingContact && (
                      <button
                        onClick={() => {
                          setEditingContact(true);
                          setContactForm({
                            firstName: modalOrder.contactDetails?.firstName || modalOrder.user?.name?.split(' ')[0] || '',
                            lastName: modalOrder.contactDetails?.lastName || modalOrder.user?.name?.split(' ')[1] || '',
                            email: modalOrder.contactDetails?.email || modalOrder.user?.email || '',
                            phone: modalOrder.contactDetails?.phone || '',
                          });
                        }}
                        className="px-3 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: '#4f46e5' }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingContact ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={contactForm.firstName || ''}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        className="w-full p-2 rounded border text-sm"
                        style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={contactForm.lastName || ''}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        className="w-full p-2 rounded border text-sm"
                        style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={contactForm.email || ''}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full p-2 rounded border text-sm"
                        style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={contactForm.phone || ''}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full p-2 rounded border text-sm"
                        style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(`${API}/api/orders/${modalOrder._id}/contact`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ contactDetails: contactForm }),
                              });
                              if (!response.ok) throw new Error('Failed to update contact details');
                              toast.success('Contact details updated');
                              setEditingContact(false);
                              dispatch(fetchOrders());
                            } catch (error) {
                              toast.error(error.message);
                            }
                          }}
                          className="flex-1 px-2 py-2 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingContact(false)}
                          className="flex-1 px-2 py-2 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: '#6b7280' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>First Name</p>
                        <p style={{ color: 'var(--color-text-primary, #000000)' }}>{contactForm.firstName || modalOrder.contactDetails?.firstName || modalOrder.user?.name?.split(' ')[0] || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Last Name</p>
                        <p style={{ color: 'var(--color-text-primary, #000000)' }}>{contactForm.lastName || modalOrder.contactDetails?.lastName || modalOrder.user?.name?.split(' ')[1] || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Email</p>
                        <p style={{ color: 'var(--color-text-primary, #000000)' }}>{contactForm.email || modalOrder.contactDetails?.email || modalOrder.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Phone</p>
                        <p style={{ color: 'var(--color-text-primary, #000000)' }}>{contactForm.phone || modalOrder.contactDetails?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping & Billing Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div className="p-4 rounded-lg border-2" style={{
                    backgroundColor: 'var(--color-bg-section, #e5e5e5)',
                    borderColor: 'var(--color-border-light, #e5e5e5)'
                  }}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>Shipping Address</h4>
                      {!editingShipping && (
                        <button
                          onClick={() => {
                            setEditingShipping(true);
                            setShippingForm(modalOrder.shippingAddress || {});
                          }}
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: '#4f46e5' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingShipping ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Address"
                          value={shippingForm.address || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Apartment / Suite (Optional)"
                          value={shippingForm.apartment || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, apartment: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingForm.city || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="State / Region (Optional)"
                          value={shippingForm.stateRegion || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, stateRegion: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={shippingForm.postalCode || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={shippingForm.country || ''}
                          onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`${API}/api/orders/${modalOrder._id}/shipping`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ shippingAddress: shippingForm }),
                                });
                                if (!response.ok) throw new Error('Failed to update shipping address');
                                toast.success('Shipping address updated');
                                setEditingShipping(false);
                                dispatch(fetchOrders());
                              } catch (error) {
                                toast.error(error.message);
                              }
                            }}
                            className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingShipping(false)}
                            className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: '#6b7280' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {modalOrder.shippingAddress ? (
                          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-primary, #000000)' }}>
                            <div className="font-semibold">{shippingForm.address || modalOrder.shippingAddress.address}</div>
                            {(shippingForm.apartment || modalOrder.shippingAddress.apartment) && <div>{shippingForm.apartment || modalOrder.shippingAddress.apartment}</div>}
                            <div>{shippingForm.city || modalOrder.shippingAddress.city}{(shippingForm.stateRegion || modalOrder.shippingAddress.stateRegion) ? `, ${shippingForm.stateRegion || modalOrder.shippingAddress.stateRegion}` : ''} {shippingForm.postalCode || modalOrder.shippingAddress.postalCode}</div>
                            <div>{shippingForm.country || modalOrder.shippingAddress.country}</div>
                          </div>
                        ) : <div className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>No shipping address provided.</div>}
                      </>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div className="p-4 rounded-lg border-2" style={{
                    backgroundColor: 'var(--color-bg-section, #e5e5e5)',
                    borderColor: 'var(--color-border-light, #e5e5e5)'
                  }}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>Billing Address</h4>
                      {!editingBilling && (
                        <button
                          onClick={() => {
                            setEditingBilling(true);
                            setBillingForm(modalOrder.billingAddress || {});
                          }}
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: '#4f46e5' }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingBilling ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Address"
                          value={billingForm.address || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Apartment / Suite (Optional)"
                          value={billingForm.apartment || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, apartment: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={billingForm.city || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="State / Region (Optional)"
                          value={billingForm.stateRegion || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, stateRegion: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={billingForm.postalCode || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={billingForm.country || ''}
                          onChange={(e) => setBillingForm({ ...billingForm, country: e.target.value })}
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`${API}/api/orders/${modalOrder._id}/billing`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ billingAddress: billingForm }),
                                });
                                if (!response.ok) throw new Error('Failed to update billing address');
                                toast.success('Billing address updated');
                                setEditingBilling(false);
                                dispatch(fetchOrders());
                              } catch (error) {
                                toast.error(error.message);
                              }
                            }}
                            className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingBilling(false)}
                            className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: '#6b7280' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {modalOrder.billingAddress ? (
                          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-primary, #000000)' }}>
                            <div className="font-semibold">{billingForm.address || modalOrder.billingAddress.address}</div>
                            {(billingForm.apartment || modalOrder.billingAddress.apartment) && <div>{billingForm.apartment || modalOrder.billingAddress.apartment}</div>}
                            <div>{billingForm.city || modalOrder.billingAddress.city}{(billingForm.stateRegion || modalOrder.billingAddress.stateRegion) ? `, ${billingForm.stateRegion || modalOrder.billingAddress.stateRegion}` : ''} {billingForm.postalCode || modalOrder.billingAddress.postalCode}</div>
                            <div>{billingForm.country || modalOrder.billingAddress.country}</div>
                          </div>
                        ) : <div className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Same as shipping</div>}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--color-border-light, #e5e5e5)'
                }}>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Order Items</h4>
                  <div className="space-y-4">
                    {modalOrder.orderItems?.map(item => {
                      // Build variant string for display
                      const variantParts = [];
                      if (item.selectedVariants && typeof item.selectedVariants === 'object') {
                        Object.entries(item.selectedVariants).forEach(([k, v]) => {
                          if (v) variantParts.push(`${k}: ${v}`);
                        });
                      }
                      if (item.selectedSize && !variantParts.some(p => p.toLowerCase().includes('size'))) {
                        variantParts.push(`Size: ${item.selectedSize}`);
                      }
                      if (item.selectedColor && !variantParts.some(p => p.toLowerCase().includes('color'))) {
                        variantParts.push(`Color: ${item.selectedColor}`);
                      }
                      const variantString = variantParts.join(' / ');

                      return (
                        <div key={item._id || item.product} className="flex gap-3 sm:gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                          {/* Product Image */}
                          <div className="shrink-0">
                            <img src={getImgSrc(item.image)} alt={item.name} className="w-full h-full sm:w-20 sm:h-20 object-contain rounded border" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }} />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--color-text-primary, #000000)' }}>{item.name}</h3>
                            {variantString && (
                              <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>{variantString}</p>
                            )}
                            {item.sku && (
                              <p className="text-xs mb-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>SKU: {item.sku}</p>
                            )}
                            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Qty: {item.qty} × £{Number(item.price).toFixed(2)}</p>
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-base sm:text-lg" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                              £{(item.qty * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary & Payment Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Summary */}
                  <div className="p-4 rounded-lg border-2" style={{
                    backgroundColor: 'white',
                    borderColor: 'var(--color-border-light, #e5e5e5)'
                  }}>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Items:</span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>£{((modalOrder.itemsPrice ?? modalOrder.orderItems?.reduce((s, it) => s + it.price * it.qty, 0)) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Shipping:</span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>£{(modalOrder.shippingPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Tax:</span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>£{(modalOrder.taxPrice || 0).toFixed(2)}</span>
                      </div>
                      {modalOrder.discountAmount > 0 && modalOrder.couponCode && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Discount ({modalOrder.couponCode}):</span>
                          <span className="font-semibold" style={{ color: '#10b981' }}>-£{(modalOrder.discountAmount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--color-border-light, #e5e5e5)', color: 'var(--color-accent-primary, #a5632a)' }}>
                        <span>Total:</span>
                        <span>£{(modalOrder.totalPrice || modalOrder.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Status */}
                  <div className="p-4 rounded-lg border-2" style={{
                    backgroundColor: 'white',
                    borderColor: 'var(--color-border-light, #e5e5e5)'
                  }}>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Fulfillment</h4>
                    <div className="px-3 py-2 rounded text-sm font-semibold" style={{
                      backgroundColor: modalOrder.fulfillmentStatus === 'fulfilled' ? 'var(--color-accent-primary, #a5632a)' : 'var(--color-bg-section, #e5e5e5)',
                      color: modalOrder.fulfillmentStatus === 'fulfilled' ? 'white' : 'var(--color-text-primary, #000000)'
                    }}>
                      {modalOrder.fulfillmentStatus === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled'}
                    </div>
                  </div>

                  {/* Delivery Status */}
                  <div className="p-4 rounded-lg border-2" style={{
                    backgroundColor: 'white',
                    borderColor: 'var(--color-border-light, #e5e5e5)'
                  }}>
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Delivery</h4>
                    <div className="px-3 py-2 rounded text-sm font-semibold" style={{
                      backgroundColor: modalOrder.deliveryStatus === 'refunded' ? '#dc2626' : (modalOrder.deliveryStatus === 'delivered' ? 'var(--color-accent-primary, #a5632a)' : (modalOrder.deliveryStatus === 'shipped' ? '#d4905e' : 'var(--color-bg-section, #e5e5e5)')),
                      color: modalOrder.deliveryStatus ? 'white' : 'var(--color-text-primary, #000000)'
                    }}>
                      {modalOrder.deliveryStatus === 'refunded' ? '⚠️ Refunded' : (modalOrder.deliveryStatus === 'delivered' ? '✓ Delivered' : (modalOrder.deliveryStatus === 'shipped' ? '📦 Shipped' : '⏳ No Status'))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Block */}
            <div className="md:col-span-1 border-l flex flex-col overflow-auto" style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 p-6 border-b" style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
                <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Overview</h4>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-auto">
                {/* Customer Total Orders */}
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--color-border-light, #e5e5e5)'
                }}>
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Total Orders From this Customer</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                    {localOrders.filter(o => o.user === modalOrder.user || o.user?._id === modalOrder.user?._id).length}
                  </p>
                </div>

                {/* Customer Details Card */}
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--color-border-light, #e5e5e5)'
                }}>
                  <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>CUSTOMER DETAILS</p>
                  <div className="space-y-3">
                    {/* Customer Name */}
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Name</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>
                        {modalOrder.contactDetails?.firstName || modalOrder.user?.name?.split(' ')[0] || 'N/A'} {modalOrder.contactDetails?.lastName || modalOrder.user?.name?.split(' ')[1] || ''}
                      </p>
                    </div>

                    {/* Customer Email */}
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Email</p>
                      <p className="text-sm font-semibold break-all" style={{ color: 'var(--color-text-primary, #000000)' }}>
                        {modalOrder.contactDetails?.email || modalOrder.user?.email || 'N/A'}
                      </p>
                    </div>

                    {/* Customer Phone */}
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Phone</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary, #000000)' }}>
                        {modalOrder.contactDetails?.phone || 'N/A'}
                      </p>
                    </div>

                    {/* View Customer Profile Button */}
                    <button
                      onClick={() => {
                        const customerEmail = modalOrder.contactDetails?.email || modalOrder.user?.email;
                        if (customerEmail) {
                          window.location.href = `/admin/customers?email=${encodeURIComponent(customerEmail)}`;
                        }
                      }}
                      className="w-full mt-3 px-3 py-2 rounded text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
                    >
                      View Customer Profile
                    </button>
                  </div>
                </div>

                {/* Remarks Block */}
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--color-border-light, #e5e5e5)'
                }}>
                  <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>REMARKS</p>

                  {/* Input Area */}
                  <div className="border rounded mb-4" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                    <textarea
                      placeholder="Add notes or remarks about this order..."
                      className="w-full p-3 text-sm resize-none focus:outline-none"
                      style={{
                        color: 'var(--color-text-primary, #000000)',
                        backgroundColor: 'var(--color-bg-primary, #ffffff)',
                        borderBottom: `1px solid var(--color-border-light, #e5e5e5)`
                      }}
                      rows="4"
                      value={remarksText}
                      onChange={(e) => setRemarksText(e.target.value)}
                    />
                    <button
                      className="w-full px-3 py-2 font-semibold text-white text-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
                      onClick={async () => {
                        if (!remarksText.trim()) {
                          toast.error('Please enter a remark');
                          return;
                        }
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API}/api/orders/${modalOrder._id}/remarks`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ remarks: remarksText }),
                          });
                          if (!response.ok) throw new Error('Failed to save remarks');
                          toast.success('Remarks saved');
                          setRemarksText('');
                          dispatch(fetchOrders());
                        } catch (error) {
                          toast.error(error.message);
                        }
                      }}
                    >
                      Save Remarks
                    </button>
                  </div>

                  {/* Saved Remarks Display */}
                  {modalOrder.remarks && (
                    <div className="p-3 rounded" style={{
                      backgroundColor: 'var(--color-bg-section, #e5e5e5)',
                      borderLeft: `4px solid var(--color-accent-primary, #a5632a)`
                    }}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>SAVED REMARK</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>
                          {new Date(modalOrder.updatedAt).toLocaleDateString()} {new Date(modalOrder.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
                        {modalOrder.remarks}
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: '#4f46e5' }}
                          onClick={() => {
                            setRemarksText(modalOrder.remarks);
                            setEditingRemarkId(modalOrder._id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 px-2 py-1 rounded text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: '#dc2626' }}
                          onClick={async () => {
                            if (!confirm('Delete this remark?')) return;
                            try {
                              const token = localStorage.getItem('token');
                              const response = await fetch(`${API}/api/orders/${modalOrder._id}/remarks`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ remarks: '' }),
                              });
                              if (!response.ok) throw new Error('Failed to delete remarks');
                              toast.success('Remarks deleted');
                              setRemarksText('');
                              dispatch(fetchOrders());
                            } catch (error) {
                              toast.error(error.message);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

