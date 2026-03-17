import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import URLRedirectManagement from '../../components/Admin/URLRedirectManagement/URLRedirectManagement';

const AdminURLRedirectPage = () => {
  return (
    <AdminLayout activeTab="redirects">
      <URLRedirectManagement />
    </AdminLayout>
  );
};

export default AdminURLRedirectPage;
