'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { backendFetch } from '../../../lib/backendFetch';
import DataTable from '../../../shared/components/DataTable';
import { useSearchStore } from '@/store/searchStore';
import { UserPlus, Shield, Mail, KeyRound, Save } from 'lucide-react';

export default function UsersManagementView() {
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleCode: 'SALES_EXECUTIVE'
  });

  const fetchUsers = async () => {
    try {
      const data = await backendFetch('/api/backend/users');
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || 'admin123',
        roleCode: formData.roleCode
      };
      await backendFetch('/api/backend/users', { method: 'POST', body: payload });
      showToast('User created successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', roleCode: 'SALES_EXECUTIVE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Failed to create user: ' + (err?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card">
      <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 className="card-heading">System Users & Roles</h2>
          <span style={{ fontSize: '11px', color: '#5E6B82' }}>Manage user access and credentials</span>
        </div>
        <button 
          className="action-btn"
          style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={16} /> Create User
        </button>
      </div>

      <DataTable 
        columns={[
          { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
          { header: 'Email Address', accessor: 'email' },
          { header: 'Role Code', accessor: 'role', render: (row) => (
            <span style={{ padding: '4px 8px', background: '#F1F5F9', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
              {row.role?.code || '—'}
            </span>
          )},
          { header: 'Status', accessor: 'isActive', render: (row) => (
            <span style={{ color: row.isActive ? '#16a34a' : '#ef4444', fontWeight: 'bold', fontSize: '11px' }}>
              {row.isActive ? 'Active' : 'Disabled'}
            </span>
          )}
        ]}
        data={users}
        searchQuery={globalSearch}
        searchField="name"
        emptyMessage="No users found."
      />

      {showAddModal && (
        <div className="modal-overlay active" onClick={() => setShowAddModal(false)} style={{ zIndex: 10000, padding: '16px' }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Create New User</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <UserPlus size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="text" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address (Login ID)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <Mail size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="email" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@himalayaerp.com" />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <KeyRound size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="password" minLength={6} style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Leave blank for 'admin123'" />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>Default password is admin123</span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Role</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <Shield size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <select required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px', cursor: 'pointer' }} 
                    value={formData.roleCode} onChange={e => setFormData({...formData, roleCode: e.target.value})}>
                    <option value="SALES_EXECUTIVE">Sales Executive</option>
                    <option value="PLANT_HEAD">Plant Head</option>
                    <option value="PRODUCTION_OPERATOR">Production Operator</option>
                    <option value="QC_INSPECTOR">QC Inspector</option>
                    <option value="DISPATCH_EXECUTIVE">Dispatch Executive</option>
                    <option value="FINANCE_EXECUTIVE">Finance Executive</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="HR">HR</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="action-btn" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }}>
                <Save size={18} /> {loading ? 'Creating...' : 'Create System User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
