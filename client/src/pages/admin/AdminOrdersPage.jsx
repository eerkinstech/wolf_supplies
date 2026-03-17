import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import OrderManagement from '../../components/Admin/OrderManagement/OrderManagement';

const AdminOrdersPage = () => {
  return (
    <AdminLayout activeTab="orders">
      <div className="p-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Orders Management</h1>
        <p className="mt-4" style={{ color: 'var(--color-text-light)' }}>Manage all customer orders and track shipments</p>
        <OrderManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
