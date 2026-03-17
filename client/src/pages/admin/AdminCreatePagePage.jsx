import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout'; 
import CreatePage from '../../components/Admin/PageBuilder/CreatePage';

const AdminCreatePagePage = () => {
    return (
        <AdminLayout>
            <CreatePage />
        </AdminLayout>
    );
};

export default AdminCreatePagePage;
