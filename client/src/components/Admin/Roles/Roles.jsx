'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const Roles = () => {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'employees'

  // Roles state
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [showPlainPassword, setShowPlainPassword] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    customRole: '',
  });

  // Fetch roles and permissions on mount
  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
      fetchAvailablePermissions();
    } else {
      fetchEmployees();
      fetchAvailableRoles();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API}/api/roles`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setRoles((data.roles && Array.isArray(data.roles)) ? data.roles : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API}/api/roles/permissions`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      if (data.permissions && Array.isArray(data.permissions)) {
        // Map permissions to have both id and label for component compatibility
        const mappedPermissions = data.permissions.map(p => ({
          ...p,
          id: p._id || p.id,
          label: p.name || p.label,
          icon: p.icon || 'fas fa-check'
        }));
        setAvailablePermissions(mappedPermissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error(error.message);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API}/api/roles`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setAvailableRoles((data.roles && Array.isArray(data.roles)) ? data.roles : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSelectAll = () => {
    if (formData.permissions.length === availablePermissions.length) {
      setFormData(prev => ({
        ...prev,
        permissions: [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: availablePermissions.map(p => p.id),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error('Select at least one permission');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingRole ? `${API}/api/roles/${editingRole._id}` : `${API}/api/roles`;
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save role');
      }

      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
      fetchRoles();
      resetForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/roles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== EMPLOYEE FUNCTIONS =====
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${API}/api/employees`, { headers });

      // Check if response is OK
      if (!response.ok) {
        // Check if response is HTML (error page) or JSON (error message)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error(`Server error (${response.status}): Make sure you're logged in as an admin`);
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || errorData.message || `Failed to fetch employees (${response.status})`);
        } catch {
          throw new Error(`Failed to fetch employees (${response.status})`);
        }
      }

      // Even for 200 responses, make sure we actually got JSON
      const okContentType = response.headers.get('content-type') || '';
      if (!okContentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non‑JSON response for employees:', text);
        throw new Error('Server returned non‑JSON response for employees. Please check backend /api/employees.');
      }

      const data = await response.json();
      setEmployees((data.employees && Array.isArray(data.employees)) ? data.employees : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (!employeeFormData.name.trim()) {
      toast.error('Employee name is required');
      return;
    }

    if (!employeeFormData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!editingEmployee && !employeeFormData.password.trim()) {
      toast.error('Password is required for new employees');
      return;
    }

    if (editingEmployee && changePassword && !employeeFormData.password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingEmployee
        ? `${API}/api/employees/${editingEmployee._id}`
        : `${API}/api/employees`;
      const method = editingEmployee ? 'PUT' : 'POST';

      const payload = { ...employeeFormData };

      // When editing, only include password if user explicitly chose to change it
      if (editingEmployee && !changePassword) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to save employee';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.message || error.detail || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success(editingEmployee ? 'Employee updated successfully' : 'Employee created successfully');
      fetchEmployees();
      resetEmployeeForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      customRole: employee.customRole?.id || '',
      password: '',
    });
    setChangePassword(false);
    setShowPlainPassword(false);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"?`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to delete employee';

        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.message || error.detail || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      customRole: '',
    });
    setEditingEmployee(null);
    setShowEmployeeForm(false);
    setChangePassword(false);
    setShowPlainPassword(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  if (loading && roles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <i className="fas fa-spinner animate-spin text-4xl text-gray-700"></i>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'roles'
            ? 'text-gray-900 border-gray-900'
            : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
        >
          <i className="fas fa-lock mr-2"></i>Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'employees'
            ? 'text-gray-900 border-gray-900'
            : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
        >
          <i className="fas fa-people-gear mr-2"></i>Employees
        </button>
      </div>

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                <i className="fas fa-plus"></i> Create Role
              </button>
            )}
          </div>
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter role name (e.g., Editor, Manager)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    disabled={editingRole?.isSystem}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter role description"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Permissions
                  </label>

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={formData.permissions.length === availablePermissions.length && availablePermissions.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="select-all" className="ml-2 font-semibold text-gray-700 cursor-pointer">
                      Select All Permissions
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {availablePermissions.map(permission => (
                      <label
                        key={permission.id}
                        className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-400 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="ml-3 flex items-center gap-2">
                          <i className={`${permission.icon} text-gray-600`}></i>
                          <span className="font-medium text-gray-700">{permission.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.permissions.length} / {availablePermissions.length}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[var(--color-accent-primary)] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Bar */}
          {!showForm && (
            <div className="mb-6 relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <i className="fas fa-search text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
          )}

          {/* Roles Table */}
          {!showForm && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Permissions</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map(role => (
                      <tr key={role._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{role.name}</span>
                            {role.isSystem && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                System
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {role.description || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              <>
                                {role.permissions.slice(0, 3).map(permission => {
                                  const perm = availablePermissions.find(p => p.id === permission);
                                  return perm ? (
                                    <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                      {perm.label}
                                    </span>
                                  ) : null;
                                })}
                                {role.permissions.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                    +{role.permissions.length - 3} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center space-x-3">
                          <button
                            onClick={() => handleEdit(role)}
                            disabled={role.isSystem}
                            className="text-[var(--color-accent-primary)] hover:text-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={role.isSystem ? 'Cannot edit system roles' : 'Edit role'}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            disabled={role.isSystem}
                            className="text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={role.isSystem ? 'Cannot delete system roles' : 'Delete role'}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-600">
                        {searchQuery ? 'No roles found matching your search' : 'No roles created yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            {!showEmployeeForm && (
              <button
                onClick={() => {
                  setShowEmployeeForm(true);
                  setShowPlainPassword(false);
                }}
                className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                <i className="fas fa-plus"></i> Create Employee
              </button>
            )}
          </div>

          {/* Create/Edit Employee Form */}
          {showEmployeeForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
              </h2>

              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={employeeFormData.name}
                      onChange={handleEmployeeInputChange}
                      placeholder="Enter full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={employeeFormData.email}
                      onChange={handleEmployeeInputChange}
                      placeholder="Enter email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={employeeFormData.phone}
                      onChange={handleEmployeeInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password {!editingEmployee && <span className="text-red-500">*</span>}
                    </label>
                    {editingEmployee && (
                      <div className="mb-3 flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <input
                          type="checkbox"
                          id="changePassword"
                          checked={changePassword}
                          onChange={(e) => {
                            setChangePassword(e.target.checked);
                            if (!e.target.checked) {
                              setEmployeeFormData(prev => ({ ...prev, password: '' }));
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="changePassword" className="cursor-pointer text-sm text-gray-700">
                          Change password
                        </label>
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type={showPlainPassword ? "text" : "password"}
                        name="password"
                        value={employeeFormData.password}
                        onChange={handleEmployeeInputChange}
                        placeholder={editingEmployee ? 'Leave empty to keep current password' : 'Enter password'}
                        disabled={editingEmployee && !changePassword}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPlainPassword(!showPlainPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        title={showPlainPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showPlainPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {employeeFormData.password && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1"><strong>Plain Password:</strong></p>
                        <p className="text-sm font-mono bg-white p-2 rounded border border-yellow-300 break-all">{employeeFormData.password}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign Role
                    </label>
                    <select
                      name="customRole"
                      value={employeeFormData.customRole}
                      onChange={handleEmployeeInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                    >
                      <option value="">-- No Custom Role --</option>
                      {availableRoles.map(role => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[var(--color-accent-primary)] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                  <button
                    type="button"
                    onClick={resetEmployeeForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Bar */}
          {!showEmployeeForm && (
            <div className="mb-6 relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <i className="fas fa-search text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
              />
              {employeeSearchQuery && (
                <button
                  onClick={() => setEmployeeSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}
            </div>
          )}

          {/* Employees Table */}
          {!showEmployeeForm && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <tr key={emp._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{emp.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {emp.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {emp.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {emp.customRole ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {emp.customRole.name || emp.customRole}
                            </span>
                          ) : (
                            <span className="text-gray-500">No Role</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center space-x-3">
                          <button
                            onClick={() => handleEditEmployee(emp)}
                            className="text-[var(--color-accent-primary)] hover:text-blue-800 transition"
                            title="Edit employee"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete employee"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                        {employeeSearchQuery ? 'No employees found matching your search' : 'No employees created yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Roles;
