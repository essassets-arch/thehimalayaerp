'use client';



import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import { useERP } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';
import DataTable from '../../../shared/components/DataTable';
import Swal from 'sweetalert2';
import * as adminService from '../../../services/admin.service';
import { 
  BarChart3, Wrench, Shield, Layers, ShieldAlert, Box, DollarSign, Users, FileText, 
  Package, ClipboardList, Edit3, Trash2, UserPlus, Plus, Key, RefreshCw, UserCheck, UserX 
} from 'lucide-react';

const MODULES_LIST = [
  { key: 'leads', name: 'Leads' },
  { key: 'customers', name: 'Customers' },
  { key: 'quotations', name: 'Quotations' },
  { key: 'orders', name: 'Orders' },
  { key: 'samples', name: 'Samples' },
  { key: 'production', name: 'Production' },
  { key: 'store', name: 'Store / Inventory' },
  { key: 'dispatch', name: 'Dispatch / Logistics' },
  { key: 'finance', name: 'Finance / Accounts' },
  { key: 'hr', name: 'HR / Payroll' },
  { key: 'users', name: 'Users & Roles' }
];

export default function AdminPortal() {
  const params = useParams(); const view = params?.slug?.[0];
  const { state, syncData } = useERP();
  const { user } = useAuth();
  const globalSearch = useSearchStore(s => s.globalSearch);

  const auditLogs = state.auditLogs || [];
  const finishedInventory = state.finishedInventory || [];
  const orders = state.sales?.orders || [];
  const payments = state.payments || [];
  const employees = state.employees || [];
  const usersList = state.users || [];

  const [workspaces, setWorkspaces] = useState([]);
  const [localRoles, setLocalRoles] = useState([]);
  const activeRoles = localRoles.length > 0 ? localRoles : (state.roles || []);
  
  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [userForm, setUserForm] = useState({
    id: '',
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Sales',
    role_id: '',
    workspace_id: '',
    password: '',
    status: 'Active'
  });

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState('create');
  const [roleForm, setRoleForm] = useState({
    id: '',
    name: '',
    description: '',
    permissions: {
      modules: {}
    }
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [wsRes, rolesRes] = await Promise.all([
          adminService.getWorkspaces().catch(() => ({ data: [] })),
          adminService.getRoles().catch(() => ([]))
        ]);
        if (wsRes && (wsRes.success || wsRes.data)) {
          setWorkspaces(wsRes.data || []);
        }
        const rolesList = Array.isArray(rolesRes) ? rolesRes : (rolesRes?.data || []);
        if (rolesList.length > 0) {
          setLocalRoles(rolesList);
        }
      } catch (err) {
        console.error('Failed to load workspaces/roles:', err);
      }
    };
    loadInitialData();
  }, []);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userForm.role_id === '') {
        return Swal.fire('Error', 'Please select a role', 'error');
      }
      
      const numericRoleId = userForm.role_id ? parseInt(userForm.role_id, 10) : undefined;
      const defaultBranchId = workspaces?.[0]?.id || user?.branch_id || 1;
      const numericBranchId = userForm.workspace_id ? parseInt(userForm.workspace_id, 10) : parseInt(defaultBranchId, 10);
      const payload = {
        ...userForm,
        roleId: numericRoleId,
        role_id: numericRoleId,
        branchId: numericBranchId,
        workspace_id: numericBranchId,
        companyId: user?.company_id || 1,
        company_id: user?.company_id || 1
      };

      if (userModalMode === 'create') {
        await adminService.createUser(payload);
        Swal.fire('Success', 'User created successfully', 'success');
      } else {
        await adminService.updateUser(userForm.id, payload);
        Swal.fire('Success', 'User settings updated successfully', 'success');
      }
      setShowUserModal(false);
      await syncData();
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to save user', 'error');
    }
  };

  const handleDeleteUser = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete User ${name}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });
    if (confirm.isConfirmed) {
      try {
        await adminService.deleteUser(id);
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        await syncData();
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete user', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (row) => {
    const nextStatus = row.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.toggleUserStatus(row.id, nextStatus);
      Swal.fire('Status Updated', `User is now ${nextStatus}`, 'success');
      await syncData();
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleResetPassword = async (id, name) => {
    const { value: password } = await Swal.fire({
      title: `Reset Password for ${name}`,
      input: 'password',
      inputLabel: 'New Passcode / Password',
      inputPlaceholder: 'Enter new passcode',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true
    });
    if (password) {
      if (password.length < 4) {
        return Swal.fire('Error', 'Password must be at least 4 characters long', 'error');
      }
      try {
        await adminService.resetUserPassword(id, password);
        Swal.fire('Success', 'Password has been reset successfully', 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to reset password', 'error');
      }
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...roleForm,
        company_id: user?.company_id || 1
      };
      if (roleModalMode === 'create') {
        await adminService.createRole(payload);
        Swal.fire('Success', 'Role created successfully', 'success');
      } else {
        await adminService.updateRole(roleForm.id, payload);
        Swal.fire('Success', 'Role updated successfully', 'success');
      }
      setShowRoleModal(false);
      await syncData();
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to save role', 'error');
    }
  };

  const handleDeleteRole = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete Role "${name}"?`,
      text: "This will fail if users are assigned to this role.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });
    if (confirm.isConfirmed) {
      try {
        await adminService.deleteRole(id);
        Swal.fire('Deleted!', 'Role has been removed.', 'success');
        await syncData();
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete role', 'error');
      }
    }
  };

  // 1. Dashboard Summary
  const renderDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="app-card border-left-blue">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>System Active Roles</span>
            <h3>{state.roles?.length || 0} Roles</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Fully isolated access control</p>
          </div>
          <div className="app-card border-left-emerald">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Ledger Integrity</span>
            <h3>Immutable</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Audit logs protected</p>
          </div>
          <div className="app-card border-left-amber">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Active Database Tables</span>
            <h3>14 Tables</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Synchronized client-side</p>
          </div>
        </div>

        <div className="app-card">
          <h3 className="card-heading">Recent Administrative Activity Log</h3>
          <DataTable 
            columns={[
              { header: 'Log ID', accessor: 'id' },
              { header: 'User Ref', accessor: 'user' },
              { header: 'Action Name', accessor: 'action' },
              { header: 'Order Ref', accessor: 'orderNo' },
              { header: 'Remarks Details', accessor: 'remarks' }
            ]}
            data={auditLogs.slice(0, 5)}
            searchQuery={globalSearch}
            searchField="user"
            emptyMessage="No system audit logs recorded."
          />
        </div>
      </div>
    );
  };

  // 2. User Accounts Management
  const renderUsers = () => {
    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-heading" style={{ margin: 0 }}>Portal User Directory</h2>
          <button
            className="action-btn"
            style={{
              background: 'var(--color-primary)',
              color: '#000',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px'
            }}
            onClick={() => {
              setUserForm({
                id: '',
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                department: 'Sales',
                role_id: state.roles?.[0]?.id || '',
                workspace_id: workspaces?.[0]?.id || '',
                password: '',
                status: 'Active'
              });
              setUserModalMode('create');
              setShowUserModal(true);
            }}
          >
            <UserPlus size={14} /> Create User
          </button>
        </div>

        <DataTable 
          columns={[
            {
              header: 'Photo',
              accessor: 'name',
              render: (row) => {
                const initials = (row.name || row.username || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-semi)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {initials}
                  </div>
                );
              }
            },
            { header: 'Name', accessor: 'name' },
            { header: 'Email Address', accessor: 'email' },
            { header: 'Phone', accessor: 'phone', render: (row) => row.phone || 'N/A' },
            { header: 'Assigned Role', accessor: 'role', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.role || 'N/A'}</strong> },
            { header: 'Department', accessor: 'department' },
            { header: 'Branch / Workspace', accessor: 'branch_name', render: (row) => row.branch_name || 'N/A' },
            { header: 'Company', accessor: 'company_name', render: (row) => row.company_name || 'N/A' },
            {
              header: 'Access Status',
              accessor: 'status',
              render: (row) => (
                <span style={{ color: row.status === 'Active' ? '#4ade80' : '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ● {row.status || 'Active'}
                </span>
              )
            }
          ]}
          data={usersList}
          searchQuery={globalSearch}
          searchField="name"
          emptyMessage="No users configured."
          actions={(row) => (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                title="Edit User"
                className="action-btn"
                style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', padding: '6px', borderRadius: '4px', color: '#22d3ee', cursor: 'pointer' }}
                onClick={() => {
                  const names = (row.name || '').split(' ');
                  const first_name = names[0] || '';
                  const last_name = names.slice(1).join(' ') || '';
                  setUserForm({
                    id: row.id,
                    username: row.username || '',
                    first_name: row._raw?.first_name || first_name,
                    last_name: row._raw?.last_name || last_name,
                    email: row.email || '',
                    phone: row.phone || '',
                    department: row.department || 'Sales',
                    role_id: row._raw?.role_id || '',
                    workspace_id: row.workspace_id || '',
                    password: '',
                    status: row.status || 'Active'
                  });
                  setUserModalMode('edit');
                  setShowUserModal(true);
                }}
              >
                <Edit3 size={12} />
              </button>
              <button
                title="Reset Password"
                className="action-btn"
                style={{ background: 'rgba(168, 85, 247, 0.2)', border: 'none', padding: '6px', borderRadius: '4px', color: '#c084fc', cursor: 'pointer' }}
                onClick={() => handleResetPassword(row.id, row.name)}
              >
                <Key size={12} />
              </button>
              <button
                title={row.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                className="action-btn"
                style={{
                  background: row.status === 'Active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '4px',
                  color: row.status === 'Active' ? '#f59e0b' : '#4ade80',
                  cursor: 'pointer'
                }}
                onClick={() => handleToggleUserStatus(row)}
              >
                {row.status === 'Active' ? <UserX size={12} /> : <UserCheck size={12} />}
              </button>
              <button
                title="Remove User"
                className="action-btn"
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                onClick={() => handleDeleteUser(row.id, row.name)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        />
      </div>
    );
  };

  // 3. User Roles Mapping
  const renderRoles = () => {
    return (
      <div className="app-card" style={{ border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-card)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
              Role Permissions Matrix
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Manage access control groups — {activeRoles.length} roles configured
            </p>
          </div>
          <button
            style={{
              background: 'var(--color-primary)',
              color: '#000',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => {
              setRoleForm({ id: '', name: '', description: '', permissions: { modules: {} } });
              setRoleModalMode('create');
              setShowRoleModal(true);
            }}
          >
            <Plus size={14} /> New Role
          </button>
        </div>

        {/* Table — desktop */}
        <div className="roles-desktop-table" style={{ overflowX: 'auto', background: 'var(--color-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-subtle, #F5FAFE)' }}>
                {['Role Group', 'Description', 'Module Scopes', 'Active Users', 'Actions'].map((h, i) => (
                  <th key={i} style={{
                    padding: '12px 20px',
                    textAlign: i === 4 ? 'right' : 'left',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    No roles configured. Create your first role.
                  </td>
                </tr>
              ) : (
                activeRoles.map((row, idx) => {
                  let permissionsArr = [];
                  try {
                    const parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
                    if (parsed && parsed.modules) {
                      permissionsArr = Object.entries(parsed.modules).map(([k, v]) => ({ key: k, level: v }));
                    } else if (parsed && parsed.all) {
                      permissionsArr = [{ key: 'all', level: 'manage' }];
                    }
                  } catch {}

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-subtle, #F5FAFE)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: 'var(--color-primary-semi)',
                            border: '1px solid var(--color-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--color-text-primary)' }}>{typeof row === 'object' && row !== null ? (row.name || row.slug) : String(row)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>ID #{typeof row === 'object' && row !== null ? (row.id || idx + 1) : idx + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '200px' }}>
                        {row.description || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No description</span>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {permissionsArr.length === 0 ? (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No access</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {permissionsArr.slice(0, 4).map((p, pi) => (
                              <span key={pi} style={{
                                fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                                background: p.level === 'manage' ? 'var(--color-primary-semi)' : '#f1f5f9',
                                border: `1px solid ${p.level === 'manage' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                color: p.level === 'manage' ? '#24345C' : 'var(--color-text-secondary)',
                                fontWeight: '600', whiteSpace: 'nowrap'
                              }}>
                                {p.key}
                              </span>
                            ))}
                            {permissionsArr.length > 4 && (
                              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>+{permissionsArr.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                        <span style={{
                          background: 'var(--color-background-subtle, #F5FAFE)', border: '1px solid var(--color-border)',
                          borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: 'var(--color-text-primary)'
                        }}>
                          {row.user_count || 0}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            title="Edit Role"
                            onClick={() => {
                              let parsed = { modules: {} };
                              try { parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || { modules: {} }); if (!parsed.modules) parsed.modules = {}; } catch {}
                              setRoleForm({ id: row.id, name: row.name || '', description: row.description || '', permissions: parsed });
                              setRoleModalMode('edit');
                              setShowRoleModal(true);
                            }}
                            style={{
                              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                              padding: '7px 12px', borderRadius: '6px', color: '#2563eb', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            title="Delete Role"
                            onClick={() => handleDeleteRole(row.id, row.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '7px 12px', borderRadius: '6px', color: '#dc2626', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards — visible below 640px via CSS class */}
        <div className="roles-mobile-cards" style={{ background: 'var(--color-card)' }}>
          {activeRoles.map((row, idx) => {
            let permissionsArr = [];
            try {
              const parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
              if (parsed && parsed.modules) permissionsArr = Object.entries(parsed.modules).map(([k, v]) => ({ key: k, level: v }));
            } catch {}
            return (
              <div key={idx} style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px',
                padding: '16px', margin: '8px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--color-text-primary)' }}>{typeof row === 'object' && row !== null ? (row.name || row.slug) : String(row)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{(typeof row === 'object' && row !== null ? row.description : null) || 'No description'}</div>
                  </div>
                  <span style={{ background: 'var(--color-background-subtle, #F5FAFE)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '3px 8px', fontSize: '11.5px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                    {row.user_count || 0} users
                  </span>
                </div>
                {permissionsArr.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {permissionsArr.map((p, pi) => (
                      <span key={pi} style={{
                        fontSize: '11px', padding: '2px 7px', borderRadius: '4px',
                        background: p.level === 'manage' ? 'var(--color-primary-semi)' : '#f1f5f9',
                        border: `1px solid ${p.level === 'manage' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: p.level === 'manage' ? '#24345C' : 'var(--color-text-secondary)',
                        fontWeight: '600'
                      }}>{p.key}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => {
                    let parsed = { modules: {} };
                    try { parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || { modules: {} }); if (!parsed.modules) parsed.modules = {}; } catch {}
                    setRoleForm({ id: row.id, name: row.name || '', description: row.description || '', permissions: parsed });
                    setRoleModalMode('edit'); setShowRoleModal(true);
                  }} style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px', borderRadius: '6px', color: '#2563eb', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteRole(row.id, row.name)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 4. Products Master Catalog
  const renderProducts = () => {
    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Master Product Catalog</h2>
        </div>
        <DataTable 
          className="no-hover"
          columns={[
            { header: 'Product Type', accessor: 'product' },
            { header: 'Available Stocks', accessor: 'stock', render: (row) => `${row.stock} ${row.unit}` },
            { header: 'Product Codes', accessor: 'product', render: (row) => `PROD-${row.product.substring(0,3).toUpperCase()}` }
          ]}
          data={finishedInventory}
          searchQuery={globalSearch}
          searchField="product"
          emptyMessage="No products loaded."
        />
      </div>
    );
  };

  // 5. Immutable System Audit Logs
  const renderAuditLogs = () => {
    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Immutable System Audit Trails</h2>
        </div>
        <DataTable 
          columns={[
            { header: 'Log ID', accessor: 'id' },
            { header: 'Order Ref', accessor: 'orderNo', render: (row) => row.orderNo || '-' },
            { header: 'Action', accessor: 'action' },
            { header: 'Description Remarks', accessor: 'remarks' },
            { header: 'Sign-off User', accessor: 'user' },
            { header: 'Date', accessor: 'date' },
            { header: 'Time', accessor: 'time' }
          ]}
          data={auditLogs}
          searchQuery={globalSearch}
          searchField="user"
          emptyMessage="No audit logs recorded."
        />
      </div>
    );
  };

  // 6. Business Reports — all departments
  const renderReports = () => {
    const rawStockCount = (state.rawInventory || []).length;
    const lowStockCount = (state.rawInventory || []).filter(i => i.stock <= i.reorderLevel).length;
    const totalCollected = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.totalAmount, 0);

    const row = (label, value, color) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <strong style={color ? { color } : {}}>{value}</strong>
      </div>
    );

    const cardHead = (icon, label, color) => (
      <h3 style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color, borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '12px' }}>
        {icon} {label}
      </h3>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 4px 4px' }}>Centralized Business Reports</h2>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>
            Live consolidated analytics across all 8 departments — Sales · Production · Plant · Store · QC · Dispatch · Finance · HR.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* SALES */}
          <div className="app-card">
            {cardHead(<BarChart3 size={14} />, 'Sales Performance', '#10b981')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Total Orders', `${orders.length} Orders`)}
              {row('Gross Revenue Collected', `₹${totalCollected.toLocaleString('en-IN')}`, '#4ade80')}
              {row('Leads in Funnel', `${(state.sales?.leads || []).length} Leads`)}
              {row('Active Quotations', `${(state.sales?.quotations || []).filter(q => q.status === 'Pending' || q.status === 'Sent').length} Quotes`)}
              {row('Samples Pending', `${(state.sales?.samples || []).filter(s => s.status === 'Pending').length} Items`, '#fb923c')}
              {row('Orders Closed / Dispatched', `${orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length} Done`, '#4ade80')}
            </div>
          </div>

          {/* PRODUCTION */}
          <div className="app-card">
            {cardHead(<Wrench size={14} />, 'Production Floor', '#a855f7')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Work Orders Released', `${(state.workOrders || []).length} Batches`)}
              {row('Currently Running', `${orders.filter(o => o.productionStatus === 'Running').length} Active`, '#a855f7')}
              {row('Batches Completed', `${(state.workOrders || []).filter(w => w.status === 'Completed').length} Done`, '#4ade80')}
              {row('QC Failures / Rework', `${state.reproductions?.length || 0} Items`, '#f87171')}
              {row('Avg. Batch Delay', '0.8 Days')}
              {row('Shop Floor Yield', '92.8%', '#4ade80')}
            </div>
          </div>

          {/* PLANT HEAD */}
          <div className="app-card">
            {cardHead(<Shield size={14} />, 'Plant Head Approvals', '#f59e0b')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Material Requests Pending', `${(state.materialRequests || []).filter(mr => mr.status === 'Pending').length} Awaiting`, '#fb923c')}
              {row('Material Requests Approved', `${(state.materialRequests || []).filter(mr => mr.status === 'Approved').length} Cleared`, '#4ade80')}
              {row('PO Approvals Pending', `${(state.purchaseOrders || []).filter(po => po.status === 'REQUESTED').length} POs`)}
              {row('Total Clearances Issued', `${(state.materialRequests || []).filter(mr => mr.status === 'Issued').length} Issued`)}
              {row('Schedule Adherence', '96.2% On-time', '#4ade80')}
              {row('Avg. Approval TAT', '1.2 Days')}
            </div>
          </div>

          {/* STORE */}
          <div className="app-card">
            {cardHead(<Layers size={14} />, 'Store Inventory', '#eab308')}
            {(() => {
              const rawInv = state.rawInventory || [];
              const matReqs = state.materialRequests || [];
              const matCount = {};
              matReqs.forEach(mr => { const k = mr.materialName || mr.material || 'Unknown'; matCount[k] = (matCount[k] || 0) + 1; });
              const topMats = Object.entries(matCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
              const totalRawValue = rawInv.reduce((sum, i) => sum + ((i.stock || 0) * (i.unitPrice || 350)), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Total Raw Stock Items', `${rawStockCount} Categories`)}
                  {row('Raw Inventory Value', `₹${totalRawValue.toLocaleString('en-IN')}`)}
                  {row('Low Stock Alerts', `${lowStockCount} Items`, lowStockCount > 0 ? '#f87171' : '#4ade80')}
                  {row('PO Requests Raised', `${(state.purchaseOrders || []).length} POs`)}
                  {row('Material Issuances', `${matReqs.filter(mr => mr.status === 'Issued').length} Released`, '#4ade80')}
                  {topMats.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '2px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Most Requested Materials</div>
                      {topMats.map(([mat, cnt]) => (
                        <div key={mat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)' }}>{mat}</span>
                          <strong style={{ color: '#fbbf24' }}>{cnt}× Requests</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* QC */}
          <div className="app-card">
            {cardHead(<ShieldAlert size={14} />, 'QC Quality Control', '#06b6d4')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Total Samples Logged', `${(state.sales?.samples || []).length} Samples`)}
              {row('Under Testing', `${(state.sales?.samples || []).filter(s => s.status === 'Testing').length} Items`, '#06b6d4')}
              {row('Approved / Passed', `${(state.sales?.samples || []).filter(s => s.status === 'Approved').length} Passed`, '#4ade80')}
              {row('Rejected / Failed', `${(state.sales?.samples || []).filter(s => s.status === 'Rejected').length} Failed`, '#f87171')}
              {row('First Pass Yield', '94.3%', '#4ade80')}
              {row('Defect Rate', '5.7% Flagged', '#fb923c')}
            </div>
          </div>

          {/* DISPATCH */}
          <div className="app-card">
            {cardHead(<Box size={14} />, 'Dispatch Logistics', '#f97316')}
            {(() => {
              const dispatched = orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered');
              const inTransit = orders.filter(o => o.status === 'In Transit');
              const totalFreight = dispatched.reduce((sum, o) => sum + (Number(o.freightCost || o.freight) || 0), 0);
              const totalDispatchValue = dispatched.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Shipments Dispatched', `${dispatched.length} Deliveries`)}
                  {row('Currently In Transit', `${inTransit.length} Orders`, inTransit.length > 0 ? '#fb923c' : undefined)}
                  {row('Total Delivered Value', `₹${totalDispatchValue.toLocaleString('en-IN')}`)}
                  {row('Total Freight Cost', totalFreight > 0 ? `₹${totalFreight.toLocaleString('en-IN')}` : '—', '#f97316')}
                  {row('On-Time Delivery Rate', '91.4%', '#4ade80')}
                  {row('POD Confirmations', `${dispatched.filter(o => o.status === 'Delivered').length} Confirmed`)}
                </div>
              );
            })()}
          </div>

          {/* FINANCE */}
          <div className="app-card">
            {cardHead(<DollarSign size={14} />, 'Finance Receivables', '#0ea5e9')}
            {(() => {
              const totalOutstanding = payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0);
              const totalAdvance = payments.reduce((sum, p) => sum + (Number(p.advancePayment) || 0), 0);
              const collectionRate = payments.length > 0 ? Math.round((payments.filter(p => p.status === 'Paid').length / payments.length) * 100) : 0;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Revenue Collected', `₹${totalCollected.toLocaleString('en-IN')}`, '#4ade80')}
                  {row('Outstanding Receivables', `₹${totalOutstanding.toLocaleString('en-IN')}`, totalOutstanding > 0 ? '#f87171' : '#4ade80')}
                  {row('Advance Payments Held', `₹${totalAdvance.toLocaleString('en-IN')}`)}
                  {row('Invoices Verified', `${payments.filter(p => p.verified === 'Approved').length} Cleared`, '#4ade80')}
                  {row('Pending Verification', `${payments.filter(p => p.verified !== 'Approved').length} Pending`, '#fb923c')}
                  {row('Collection Efficiency', `${collectionRate}%`, collectionRate >= 70 ? '#4ade80' : '#f87171')}
                </div>
              );
            })()}
          </div>

          {/* HR */}
          <div className="app-card">
            {cardHead(<Users size={14} />, 'HR Workforce Summary', '#ec4899')}
            {(() => {
              const active = employees.filter(e => e.status === 'Active').length;
              const onLeave = employees.filter(e => e.status === 'On Leave').length;
              const depts = [...new Set(employees.map(e => e.department).filter(Boolean))].length;
              const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Total Employees', `${employees.length} Staff`)}
                  {row('Currently Active', `${active} Present`, '#4ade80')}
                  {row('On Leave', `${onLeave} Absent`, onLeave > 0 ? '#fb923c' : undefined)}
                  {row('Active Departments', `${depts} Depts`)}
                  {row('Monthly Payroll Outflow', `₹${totalPayroll.toLocaleString('en-IN')}`)}
                  {row('ERP System Users', `${usersList.length} Accounts`)}
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    );
  };

  const renderUserModal = () => {
    return (
      <div onClick={() => setShowUserModal(false)} style={{ zIndex: 10000, display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(10px)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '20px', padding: '0', position: 'relative', boxShadow: '0 25px 80px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)' }}>
          {/* User Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px', borderBottom: '1px solid #DCE5F0', background: 'linear-gradient(135deg, #F5FAFE 0%, #f1f5f9 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.02em' }}>
                {userModalMode === 'create' ? 'Create New User Account' : 'Edit User Settings'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82', fontWeight: '500' }}>Fill in all required fields</p>
            </div>
            <button onClick={() => setShowUserModal(false)} style={{ background: '#ffffff', border: '1px solid #D6E2F0', color: '#475569', cursor: 'pointer', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>✕</button>
          </div>
          {/* User Modal Form */}
          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px', background: '#ffffff' }}>
            <div className="admin-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name *</label>
                <input type="text" required value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} placeholder="e.g. Amit"
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name *</label>
                <input type="text" required value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} placeholder="e.g. Sharma"
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
              </div>
            </div>
            <div className="admin-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username *</label>
                <input type="text" required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder="e.g. ceo@himalaya.com"
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</label>
                <select value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }}>
                  {['Sales', 'Production', 'Plant Head', 'Store', 'QC', 'Dispatch', 'Finance', 'HR', 'IT', 'General'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address *</label>
              <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="name@himalaya.com"
                style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
            </div>
            <div className="admin-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                <input type="text" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} placeholder="+91 9876543210"
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</label>
                <input type="text" disabled value={user?.company_name || 'Himalaya ERP'}
                  style={{ width: '100%', background: '#f1f5f9', border: '1px solid #DCE5F0', borderRadius: '10px', padding: '12px 16px', color: '#5E6B82', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Role *</label>
                <select required value={userForm.role_id} onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })}
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }}>
                  <option value="">Select a Role</option>
                  {activeRoles.map((r, idx) => {
                    const rId = typeof r === 'object' && r !== null ? (r.id || r.name || idx) : r;
                    const rName = typeof r === 'object' && r !== null ? (r.name || r.slug || r.id || '') : String(r);
                    return <option key={rId} value={rId}>{rName}</option>;
                  })}
                </select>
              </div>
            </div>
            {userModalMode === 'create' && (
              <div>
                <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Password *</label>
                <input type="password" required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••••••"
                  style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
              </div>
            )}
            <button type="submit" style={{ background: 'linear-gradient(135deg, #24345C 0%, #1e293b 100%)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '14px', marginTop: '8px', letterSpacing: '0.02em', boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.4)', transition: 'all 0.2s' }}>
              {userModalMode === 'create' ? '✓ Create User Account' : '✓ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderRoleModal = () => {
    return (
      <div onClick={() => setShowRoleModal(false)} style={{ zIndex: 10000, display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(10px)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '20px', boxShadow: '0 25px 80px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column' }}>
          {/* Role Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px', borderBottom: '1px solid #DCE5F0', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #F5FAFE 0%, #f1f5f9 100%)', zIndex: 1, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.02em' }}>
                {roleModalMode === 'create' ? '⊕ Create Security Role' : '✎ Edit Role Permissions'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82', fontWeight: '500' }}>Define module-level access for this role</p>
            </div>
            <button onClick={() => setShowRoleModal(false)} style={{ background: '#ffffff', border: '1px solid #D6E2F0', color: '#475569', cursor: 'pointer', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>✕</button>
          </div>

          {/* Role Modal Form */}
          <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px', background: '#ffffff' }}>
            <div>
              <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Name *</label>
              <input type="text" required value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Sales Manager"
                style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
            </div>
            <div>
              <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
              <textarea value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Brief description of this role's responsibilities..."
                style={{ width: '100%', background: '#F5FAFE', border: '1.5px solid #D6E2F0', borderRadius: '10px', padding: '12px 16px', color: '#24345C', fontSize: '14px', fontWeight: '500', minHeight: '76px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
            </div>

            {/* Permission Scopes */}
            <div>
              <label style={{ color: '#334155', fontSize: '12px', display: 'block', marginBottom: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Module Permission Scopes</label>
              <div style={{ border: '1px solid #D6E2F0', borderRadius: '12px', overflow: 'hidden', background: '#F5FAFE' }}>
                {/* Legend row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '8px', padding: '10px 16px', background: '#f1f5f9', borderBottom: '1px solid #D6E2F0' }}>
                  <span style={{ fontSize: '11px', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Module</span>
                  {['No Access', 'View', 'Manage'].map(l => (
                    <span key={l} style={{ fontSize: '11px', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', minWidth: '70px' }}>{l}</span>
                  ))}
                </div>
                {MODULES_LIST.map((m, mi) => {
                  const current = roleForm.permissions.modules[m.key] || '';
                  return (
                    <div key={m.key} style={{
                      display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '8px',
                      padding: '12px 16px', alignItems: 'center',
                      background: mi % 2 === 0 ? '#ffffff' : '#F5FAFE',
                      borderBottom: mi < MODULES_LIST.length - 1 ? '1px solid #DCE5F0' : 'none'
                    }}>
                      <span style={{ fontSize: '13.5px', color: current ? '#24345C' : '#5E6B82', fontWeight: current ? '700' : '500' }}>{m.name}</span>
                      {[['', 'No Access'], ['view', 'View'], ['manage', 'Manage']].map(([val, label]) => (
                        <button key={val} type="button"
                          onClick={() => {
                            const updatedModules = { ...roleForm.permissions.modules };
                            if (val) updatedModules[m.key] = val;
                            else delete updatedModules[m.key];
                            setRoleForm({ ...roleForm, permissions: { ...roleForm.permissions, modules: updatedModules } });
                          }}
                          style={{
                            minWidth: '70px', padding: '6px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700',
                            cursor: 'pointer', border: current === val ? 'none' : '1px solid #D6E2F0', transition: 'all 0.15s ease',
                            background: current === val
                              ? val === 'manage' ? '#24345C' : val === 'view' ? '#2563eb' : '#DCE5F0'
                              : '#ffffff',
                            color: current === val
                              ? val === 'manage' ? '#ffffff' : val === 'view' ? '#ffffff' : '#475569'
                              : '#5E6B82',
                            boxShadow: current === val ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none'
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" style={{ background: 'linear-gradient(135deg, #24345C 0%, #1e293b 100%)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '14px', marginTop: '8px', letterSpacing: '0.02em', boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.4)', transition: 'all 0.2s' }}>
              {roleModalMode === 'create' ? '✓ Create Role' : '✓ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':        return renderDashboard();
      case 'users':            return renderUsers();
      case 'roles':            return renderRoles();
      case 'products':         return renderProducts();
      case 'audit-logs':       return renderAuditLogs();
      case 'reports':          return renderReports();
      default:                 return renderDashboard();
    }
  };

  return (
    <>
      {renderContent()}
      {showUserModal && renderUserModal()}
      {showRoleModal && renderRoleModal()}
    </>
  );
}
