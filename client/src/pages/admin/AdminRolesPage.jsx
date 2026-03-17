import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout.jsx';
import Roles from '../../components/Admin/Roles/Roles.jsx';

const AdminRolesPage = () => {
  return (
    <AdminLayout activeTab="roles">
      <Roles />
    </AdminLayout>
  );
};

export default AdminRolesPage;
