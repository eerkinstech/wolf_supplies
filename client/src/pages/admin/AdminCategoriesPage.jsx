import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import CategoryManagement from '../../components/Admin/CategoryManagement/CategoryManagement';

const AdminCategoriesPage = () => {
  return (
    <AdminLayout activeTab="categories">
      <CategoryManagement />
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
