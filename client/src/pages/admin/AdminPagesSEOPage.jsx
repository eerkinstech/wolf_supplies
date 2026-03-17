import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import PagesSEO from '../../components/Admin/PagesSEO/PagesSEO';

const AdminPagesSEOPage = () => {
  return (
    <AdminLayout activeTab="pages-seo">
      <PagesSEO />
    </AdminLayout>
  );
};

export default AdminPagesSEOPage;
