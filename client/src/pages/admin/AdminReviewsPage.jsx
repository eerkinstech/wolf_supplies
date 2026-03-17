import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import ReviewManagement from '../../components/Admin/ReviewManagement/ReviewManagement';

const AdminReviewsPage = () => {
  return (
    <AdminLayout activeTab="reviews">
      <ReviewManagement />
    </AdminLayout>
  );
};

export default AdminReviewsPage;
