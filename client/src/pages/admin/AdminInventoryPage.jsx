import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import Inventory from '../../components/Admin/Inventory/Inventory';

const AdminInventoryPage = () => {
  return (
    <AdminLayout activeTab="inventory">
      <Inventory />
    </AdminLayout>
  );
};

export default AdminInventoryPage;
