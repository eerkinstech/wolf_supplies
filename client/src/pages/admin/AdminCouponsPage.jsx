import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import CouponManagement from '../../components/Admin/CouponManagement/CouponManagement';

const AdminCouponsPage = () => {
  return (
    <AdminLayout activeTab="coupons">
      <CouponManagement />
    </AdminLayout>
  );
};

export default AdminCouponsPage;
