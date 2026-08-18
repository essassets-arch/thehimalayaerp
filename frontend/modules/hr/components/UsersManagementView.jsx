'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { backendFetch } from '../../../lib/backendFetch';
import DataTable from '../../../shared/components/DataTable';
import { useSearchStore } from '@/store/searchStore';
import { employeesService } from '../../../services/hr/employeesService';
import { UserPlus, Shield, Mail, KeyRound, Save, UserCheck } from 'lucide-react';

const mapJobTitleToRole = (title = '') => {
  const t = String(title).toUpperCase();
  if (t.includes('SALES')) return 'SALES_EXECUTIVE';
  if (t.includes('PLANT')) return 'PLANT_HEAD';
  if (t.includes('PRODUCTION') || t.includes('OPERATOR')) return 'PRODUCTION_OPERATOR';
  if (t.includes('QC') || t.includes('QUALITY')) return 'QC_INSPECTOR';
  if (t.includes('DISPATCH')) return 'DISPATCH_EXECUTIVE';
  if (t.includes('FINANCE') || t.includes('ACCOUNT')) return 'FINANCE_EXECUTIVE';
  if (t.includes('STORE') || t.includes('WAREHOUSE')) return 'STORE_MANAGER';
  if (t.includes('HR') || t.includes('HUMAN')) return 'HR';
  if (t.includes('ADMIN')) return 'SUPER_ADMIN';
  return 'SALES_EXECUTIVE';
};

export default function UsersManagementView() {
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    roleCode: 'SALES_EXECUTIVE'
  });

  const fetchData = async () => {
    try {
      const [userData, empData] = await Promise.allSettled([
        backendFetch('/api/backend/users'),
        employeesService.listEmployees({ page: 1, limit: 100 })
      ]);
      if (userData.status === 'fulfilled' && userData.value) {
        setUsers(userData.value);
      }
      if (empData.status === 'fulfilled' && empData.value?.items) {
        setEmployees(empData.value.items);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users and staff records');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        employeeId: formData.employeeId || undefined,
        name: formData.name,
        email: formData.email,
        password: formData.password || 'admin123',
        roleCode: formData.roleCode
      };
      await backendFetch('/api/backend/users', { method: 'POST', body: payload });
      showToast('System user account created and linked successfully!');
      setShowAddModal(false);
      setFormData({ employeeId: '', name: '', email: '', password: '', roleCode: 'SALES_EXECUTIVE' });
      fetchData();
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
          <h2 className="card-heading">System Users & Access Roles</h2>
          <span style={{ fontSize: '11px', color: '#5E6B82' }}>Assign system credentials and roles to corporate staff</span>
        </div>
        <button 
          className="action-btn"
          style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={16} /> Create System User
        </button>
      </div>

      <DataTable 
        columns={[
          { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
          { header: 'Email Address / Login ID', accessor: 'email' },
          { header: 'System Role', accessor: 'role', render: (row) => (
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
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Create System User</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {/* Staff Member Selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 'bold', color: '#0F172A' }}>1. Select Staff Member / Employee</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #0284c7', borderRadius: '8px', padding: '0 12px', background: '#F0F9FF', gap: '8px' }}>
                  <UserCheck size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                  <select
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#0369a1', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
                    value={formData.employeeId || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(x => x.id === empId);
                      if (emp) {
                        setFormData({
                          ...formData,
                          employeeId: emp.id,
                          name: emp.fullName,
                          email: emp.workEmail,
                          roleCode: mapJobTitleToRole(emp.jobTitle || emp.department?.name)
                        });
                      } else {
                        setFormData({ ...formData, employeeId: '' });
                      }
                    }}
                  >
                    <option value="">-- Choose Existing Employee / Staff Member --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode}) — {emp.jobTitle || emp.department?.name || 'Staff'}
                      </option>
                    ))}
                  </select>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Selecting a staff member automatically pre-fills credentials and links the user account to their employee profile.
                </span>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <UserPlus size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="text" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
              </div>

              {/* Email / Login ID */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address (Login ID)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <Mail size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="text" required style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@himalayaerp.com or HYQPP0752K" />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', background: '#fff', gap: '8px' }}>
                  <KeyRound size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <input type="password" minLength={6} style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#334155', fontSize: '14px' }} 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Leave blank for 'admin123'" />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>Default password is admin123</span>
              </div>

              {/* System Role */}
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
                <Save size={18} /> {loading ? 'Creating...' : 'Create System User & Assign Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
