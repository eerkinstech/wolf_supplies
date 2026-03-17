import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import SliderManagement from '../../components/Admin/SliderManagement/SliderManagement';

const AdminSlidersPage = () => {
  return (
    <AdminLayout activeTab="sliders">
      <SliderManagement />
    </AdminLayout>
  );
};

export default AdminSlidersPage;
