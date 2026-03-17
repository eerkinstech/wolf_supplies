import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import ProductManagement from '../../components/Admin/ProductManagement/ProductManagement';

const AdminProductsPage = () => {
  return (
    <AdminLayout activeTab="products">
      <ProductManagement />
    </AdminLayout>
  );
};

export default AdminProductsPage;
