import React from 'react';
import { useAuth } from '../../context/AuthContext';


const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-4xl text-gray-400 block mx-auto mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow all users (authenticated and guests) to access protected routes
  return children;
};

export default ProtectedRoute;
