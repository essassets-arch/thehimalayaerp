'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { apiClient } from '../../../lib/apiClient';
import DataTable from '../../../shared/components/DataTable';
import { useSearchStore } from '@/store/searchStore';
import { employeesService } from '../../../services/hr/employeesService';
import { UserPlus, Shield, Mail, KeyRound, Save, UserCheck, Trash2, UserX, Lock } from 'lucide-react';

const DEFAULT_ROLES = [
  { name: 'Super Admin', code: 'SUPER_ADMIN' },
  { name: 'HR', code: 'HR' },
  { name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
  { name: 'Sales Manager', code: 'SALES_MANAGER' },
  { name: 'SuperSales Lead', code: 'SUPER_SALES' },
  { name: 'Finance Executive', code: 'FINANCE_EXECUTIVE' },
  { name: 'Finance Manager', code: 'FINANCE_MANAGER' },
  { name: 'Dispatch 1 (Cat 1)', code: 'DISPATCH_EXECUTIVE' },
  { name: 'Dispatch 2 (Cat 2)', code: 'DISPATCH_2' },
  { name: 'Plant Head', code: 'PLANT_HEAD' },
  { name: 'Production Planner', code: 'PRODUCTION_PLANNER' },
  { name: 'Store Manager', code: 'STORE_MANAGER' },
  { name: 'QC Inspector', code: 'QC_INSPECTOR' },
  { name: 'Back Office', code: 'BACK_OFFICE' },
];

export default function UsersManagementView() {
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    roleCode: 'HR',
    department: 'HR Department'
  });

  const fetchData = async () => {
    try {
      const [usersRes, empRes, rolesRes] = await Promise.allSettled([
        apiClient.get('/admin/users'),
        employeesService.listEmployees({ page: 1, limit: 100 }),
        apiClient.get('/admin/users/roles')
      ]);

      if (usersRes.status === 'fulfilled') {
        const raw = usersRes.value?.data?.data || usersRes.value?.data || [];
        setUsers(Array.isArray(raw) ? raw : []);
      }

      if (empRes.status === 'fulfilled' && empRes.value?.items) {
        const getNum = (code) => {
          if (!code) return 999999;
          const match = String(code).match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 999999;
        };
        const sortedEmps = [...empRes.value.items].sort((a, b) => getNum(a.employeeCode) - getNum(b.employeeCode));
        setEmployees(sortedEmps);
      }

      if (rolesRes.status === 'fulfilled') {
        const rawRoles = rolesRes.value?.data?.data || rolesRes.value?.data || [];
        if (Array.isArray(rawRoles) && rawRoles.length > 0) {
          setRoles(rawRoles);
        } else {
          setRoles(DEFAULT_ROLES);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load live users and roles');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.trim().length < 8) {
      showToast('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      const matchedRole = roles.find(r => r.code === formData.roleCode || r.name === formData.roleCode);
      const payload = {
        employeeId: formData.employeeId || undefined,
        name: formData.name ? formData.name.trim() : '',
        email: formData.email ? formData.email.trim().toLowerCase() : '',
        password: formData.password ? formData.password.trim() : '',
        roleCode: matchedRole?.code || formData.roleCode,
        role: matchedRole?.name || formData.roleCode,
        department: formData.department || 'General'
      };

      await apiClient.post('/admin/users', payload);
      showToast('System user account created and synchronized successfully!');
      setShowAddModal(false);
      setFormData({ employeeId: '', name: '', email: '', password: '', roleCode: 'HR', department: 'HR Department' });
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to create user: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.isActive ? 'Inactive' : 'Active';
      await apiClient.post(`/admin/users/${user.id}/toggle-status`, { status: newStatus });
      showToast(`User status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast('Failed to toggle status: ' + (err?.response?.data?.message || err.message));
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user ${userName}?`)) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      showToast(`User ${userName} deleted successfully.`);
      fetchData();
    } catch (err) {
      showToast('Failed to delete user: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="app-card">
      <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 className="card-heading">System Users & Access Roles</h2>
          <span style={{ fontSize: '11px', color: '#5E6B82' }}>Manage corporate credentials synchronized with staff master roster</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="action-btn"
            style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={16} /> Create System User
          </button>
        </div>
      </div>

      <DataTable 
        columns={[
          { 
            header: 'Staff Code', 
            accessor: 'publicId', 
            render: (row) => (
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                color: '#0284c7', 
                fontWeight: 700,
                background: '#f0f9ff',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}>
                {row.employeeCode || row.publicId}
              </span>
            ) 
          },
          { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
          { header: 'Email Address / Login ID', accessor: 'email' },
          { 
            header: 'Security', 
            accessor: 'security', 
            render: (row) => (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  title="Passwords are one-way bcrypt hashed and can never be viewed. Contact Super Admin for password resets."
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#f8fafc',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  <Lock size={12} color="#16a34a" /> Encrypted (bcrypt)
                </span>
                {row.isLocked && (
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '2px 7px', borderRadius: '999px' }}>
                    Locked
                  </span>
                )}
              </div>
            ) 
          },
          { header: 'System Role', accessor: 'role', render: (row) => (
            <span style={{ padding: '4px 8px', background: '#F1F5F9', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>
              {typeof row.role === 'object' ? (row.role?.name || row.role?.code) : (row.role || 'Staff')}
            </span>
          )},
          { header: 'Department', accessor: 'department', render: (row) => (typeof row.department === 'object' ? (row.department?.name || 'General') : (row.department || 'General')) },
          { header: 'Status', accessor: 'isActive', render: (row) => (
            <span style={{ color: row.isActive ? '#16a34a' : '#ef4444', background: row.isActive ? '#dcfce7' : '#fee2e2', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '11px' }}>
              {row.isActive ? 'Active' : 'Disabled'}
            </span>
          )},
          { header: 'Actions', accessor: 'actions', render: (row) => (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => toggleUserStatus(row)}
                title={row.isActive ? 'Disable User' : 'Activate User'}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <UserX size={14} color={row.isActive ? '#dc2626' : '#16a34a'} />
              </button>
              <button
                onClick={() => deleteUser(row.id, row.name)}
                title="Delete User"
                style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '5px 8px', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        ]}
        data={users}
        searchQuery={globalSearch}
        searchField="name"
        emptyMessage="No users found."
      />

      {showAddModal && (
        <div className="modal-overlay active" onClick={() => setShowAddModal(false)} style={{ zIndex: 10000, padding: '16px' }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Create System User</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {/* Staff Member Selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 'bold', color: '#0F172A' }}>1. Link to Staff Member (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #0284c7', borderRadius: '8px', padding: '0 12px', background: '#F0F9FF', gap: '8px' }}>
                  <UserCheck size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                  <select
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#0369a1', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
                    value={formData.employeeId || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(x => x.id === empId);
                      if (emp) {
                        let autoRole = formData.roleCode;
                        const textToMatch = `${emp.jobTitle || ''} ${emp.department?.name || emp.department || ''}`.toLowerCase();
                        if (textToMatch.includes('sales')) {
                          const sRole = roles.find(r => r.name?.toLowerCase().includes('sales') || r.code?.toLowerCase().includes('sales'));
                          if (sRole) autoRole = sRole.code || sRole.name;
                        } else if (textToMatch.includes('hr') || textToMatch.includes('human')) {
                          const hrRole = roles.find(r => r.name?.toLowerCase().includes('hr') || r.code?.toLowerCase().includes('hr'));
                          if (hrRole) autoRole = hrRole.code || hrRole.name;
                        } else if (textToMatch.includes('production') || textToMatch.includes('plant')) {
                          const pRole = roles.find(r => r.name?.toLowerCase().includes('production') || r.name?.toLowerCase().includes('plant'));
                          if (pRole) autoRole = pRole.code || pRole.name;
                        } else if (textToMatch.includes('store') || textToMatch.includes('inventory')) {
                          const stRole = roles.find(r => r.name?.toLowerCase().includes('store'));
                          if (stRole) autoRole = stRole.code || stRole.name;
                        } else if (textToMatch.includes('dispatch') || textToMatch.includes('logistics')) {
                          const dRole = roles.find(r => r.name?.toLowerCase().includes('dispatch') || r.name?.toLowerCase().includes('logistics'));
                          if (dRole) autoRole = dRole.code || dRole.name;
                        } else if (textToMatch.includes('finance') || textToMatch.includes('account')) {
                          const fRole = roles.find(r => r.name?.toLowerCase().includes('finance'));
                          if (fRole) autoRole = fRole.code || fRole.name;
                        }

                        setFormData({
                          ...formData,
                          employeeId: emp.id,
                          name: emp.fullName || `${emp.firstName} ${emp.lastName}`.trim(),
                          email: emp.workEmail,
                          roleCode: autoRole,
                          department: typeof emp.department === 'object' ? emp.department?.name : (emp.department || 'HR Department')
                        });
                      } else {
                        setFormData({ ...formData, employeeId: '' });
                      }
                    }}
                  >
                    <option value="">-- Choose Existing Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} — {emp.fullName || `${emp.firstName} ${emp.lastName}`.trim()} ({emp.jobTitle || emp.department?.name || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
                <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Select an employee registered under Staff Master to auto-fill their credentials and synchronize ID code.
                </small>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <UserPlus size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="text" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. HR Manager" />
                </div>
              </div>

              {/* Email / Login ID */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address (Login ID) *</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <Mail size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="email" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@himalayaerp.com" />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <KeyRound size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="password" required minLength={8} style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min 8 characters (stored one-way hashed)" />
                </div>
              </div>

              {/* System Role */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Role *</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <Shield size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <select required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px', cursor: 'pointer' }} 
                    value={formData.roleCode} onChange={e => setFormData({...formData, roleCode: e.target.value})}>
                    {(roles.length > 0 ? roles : [
                      { name: 'Super Admin', code: 'SUPER_ADMIN' },
                      { name: 'HR', code: 'HR' }
                    ]).map(r => (
                      <option key={r.code || r.id || r.name} value={r.code || r.name}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none' }}
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. HR Department" />
              </div>

              <button type="submit" disabled={loading} className="action-btn" style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }}>
                <Save size={18} /> {loading ? 'Creating...' : 'Create System User & Assign Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
