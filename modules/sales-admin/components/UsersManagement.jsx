import { useState, useMemo } from 'react';
import { UserPlus, Edit2, Trash2, ShieldAlert, Sparkles, Mail, Phone, Lock } from 'lucide-react';

export default function UsersManagement({ state, dispatch, showToast }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Create user form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales Executive',
    phone: '',
    status: 'Active'
  });

  // Edit user form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales Executive',
    phone: '',
    status: 'Active'
  });

  const currentUser = state.currentUser || { name: 'Elena Rostova' };

  // Filter users to display only Sales Admin and Sales Executive
  const filteredUsers = useMemo(() => {
    return (state.users || []).filter(u => 
      u.role === 'Sales Admin' || 
      u.role === 'Sales Executive' ||
      u.role === 'Sales' // compatibility map
    );
  }, [state.users]);

  // Handle user creation
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      alert('Please fill out Name, Email, and Password.');
      return;
    }

    const userId = 'USR-' + Math.floor(100 + Math.random() * 900);
    const newUser = {
      id: userId,
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
      status: createForm.status,
      phone: createForm.phone.trim() || '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      department: 'Sales',
      permissions: createForm.role === 'Sales Admin' 
        ? ['VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_RECEIVABLES', 'VIEW_AUDIT_LOGS', 'MANAGE_USERS', 'MANAGE_TARGETS']
        : ['VIEW_DASHBOARD', 'CREATE_LEAD']
    };

    dispatch({ type: 'ADD_USER', payload: newUser });

    // Record audit log
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'User Created',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Created user ${newUser.name} with role ${newUser.role} (Status: ${newUser.status})`
      }
    });

    showToast(`Successfully registered user ${newUser.name}`);
    setShowCreateModal(false);
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'Sales Executive',
      phone: '',
      status: 'Active'
    });
  };

  // Pre-fill Edit Modal
  const startEditing = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      password: u.password || 'password',
      role: u.role === 'Sales' ? 'Sales Executive' : (u.role || 'Sales Executive'),
      phone: u.phone || '',
      status: u.status || 'Active'
    });
  };

  // Handle user edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      alert('Please fill out Name and Email.');
      return;
    }

    const updatedUser = {
      ...editingUser,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: editForm.role,
      status: editForm.status,
      phone: editForm.phone.trim(),
      permissions: editForm.role === 'Sales Admin' 
        ? ['VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_RECEIVABLES', 'VIEW_AUDIT_LOGS', 'MANAGE_USERS', 'MANAGE_TARGETS']
        : ['VIEW_DASHBOARD', 'CREATE_LEAD']
    };

    dispatch({ type: 'UPDATE_USER', payload: updatedUser });

    // Record audit log
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'User Updated',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Updated details of user ${updatedUser.name} (${updatedUser.id})`
      }
    });

    showToast(`Successfully updated user ${updatedUser.name}`);
    setEditingUser(null);
  };

  // Handle user deletion
  const handleDeleteUser = (userId, userName) => {
    if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      
      dispatch({
        type: 'ADD_AUDIT_LOG',
        payload: {
          id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
          user: currentUser.name,
          action: 'User Deleted',
          orderNo: '',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          remarks: `Deleted user ${userName} (${userId}) from records`
        }
      });

      showToast(`Deleted user ${userName}`);
    }
  };

  // Toggle status
  const handleToggleStatus = (u) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    const updated = {
      ...u,
      status: nextStatus
    };
    dispatch({ type: 'UPDATE_USER', payload: updated });
    
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'User Status Toggled',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Toggled status of user ${u.name} to ${nextStatus}`
      }
    });

    showToast(`User status set to ${nextStatus}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Table & controls */}
      <div className="card-solid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0 }}>
              User Management Directory
            </h4>
            <span style={{ fontSize: '10.5px', color: '#888' }}>
              Configure account statuses, roles, and credentials for Sales department personnel.
            </span>
          </div>

          <button 
            className="action-btn"
            style={{ 
              background: 'var(--color-primary)', 
              color: '#12161a', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={15} /> Create User
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 10px' }}>User ID</th>
                <th style={{ padding: '12px 10px' }}>Full Name</th>
                <th style={{ padding: '12px 10px' }}>Email Address</th>
                <th style={{ padding: '12px 10px' }}>Role</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No Sales users registered.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const displayRole = u.role === 'Sales' ? 'Sales Executive' : u.role;
                  return (
                    <tr key={u.id} style={{ fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                      {/* User ID */}
                      <td style={{ padding: '14px 10px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {u.id}
                      </td>
                      {/* Name */}
                      <td style={{ padding: '14px 10px' }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{u.name}</strong>
                        <span style={{ fontSize: '10px', color: '#888' }}>{u.phone || 'No phone registered'}</span>
                      </td>
                      {/* Email */}
                      <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      {/* Role */}
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: displayRole === 'Sales Admin' ? '#f3e8ff' : '#dbeafe',
                          color: displayRole === 'Sales Admin' ? '#7e22ce' : '#1d4ed8'
                        }}>
                          {displayRole}
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 10px' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            border: 'none',
                            background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: u.status === 'Active' ? '#15803d' : '#dc2626',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title={`Click to set as ${u.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          {u.status || 'Active'}
                        </button>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            title="Edit User"
                            onClick={() => startEditing(u)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '28px', height: '28px',
                              background: '#ffffff', border: '1px solid #d1d5db',
                              borderRadius: '6px', cursor: 'pointer',
                              color: '#374151', flexShrink: 0
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          
                          {/* Prevent deleting seeded admins/users */}
                          {u.id !== 'USR-002' && u.id !== 'USR-006' && u.id !== 'EMP-001' && u.id !== 'USR-001' && (
                            <button
                              title="Delete User"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '28px', height: '28px',
                                background: '#ffffff', border: '1px solid #fca5a5',
                                borderRadius: '6px', cursor: 'pointer',
                                color: '#dc2626', flexShrink: 0
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay active" onClick={() => setShowCreateModal(false)} style={{ zIndex: 10000, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', inset: 0 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px', background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800', margin: 0 }}>
                <Sparkles size={18} color="var(--accent)" /> Create New User
              </h3>
              <button className="modal-close-btn" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="john.doe@himalaya.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    placeholder="Enter security password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</label>
                  <select 
                    value={createForm.role}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Sales Admin">Sales Admin</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                  <select 
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 43210"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  background: 'var(--color-primary)', 
                  color: '#12161a', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 14px rgba(51, 122, 134, 0.15)'
                }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingUser && (
        <div className="modal-overlay active" onClick={() => setEditingUser(null)} style={{ zIndex: 10000, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', inset: 0 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px', background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800', margin: 0 }}>
                <Edit2 size={18} color="var(--accent)" /> Edit User Details
              </h3>
              <button className="modal-close-btn" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={() => setEditingUser(null)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Sales Admin">Sales Admin</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  background: 'var(--color-primary)', 
                  color: '#12161a', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 14px rgba(51, 122, 134, 0.15)'
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
