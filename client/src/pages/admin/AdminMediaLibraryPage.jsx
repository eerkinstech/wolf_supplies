import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import MediaLibrary from '../../components/Admin/MediaLibrary/MediaLibrary';

const AdminMediaLibraryPage = () => {
  return (
    <AdminLayout activeTab="media">
      <MediaLibrary />
    </AdminLayout>
  );
};

export default AdminMediaLibraryPage;
