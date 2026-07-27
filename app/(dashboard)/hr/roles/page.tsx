'use client';
import React, { useState, useEffect } from 'react';
import '@/components/erp-premium-ui.css';
import { useERPStore } from '@/store/erpStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Shield, LayoutGrid, Users, Plus, Check, X, Pencil, Trash2 } from 'lucide-react';

const AVAILABLE_PANELS = [
  { id: 'Sales', name: 'Sales', description: 'Leads, Quotations, Orders' },
  { id: 'Production', name: 'Production', description: 'Work Orders, Floor, Finished Goods' },
  { id: 'Plant Head', name: 'Plant Head', description: 'Planning, Material Approvals' },
  { id: 'Store', name: 'Store', description: 'Raw Inventory, Material Requests' },
  { id: 'QC', name: 'Quality Control', description: 'Pending Inspections, Certificates' },
  { id: 'Dispatch', name: 'Dispatch', description: 'Deliveries, In-Transit, Vehicles' },
  { id: 'Finance', name: 'Finance', description: 'Payments, Invoices, Receipts' },
  { id: 'HR', name: 'Human Resources', description: 'Employees, Attendance, Salary' },
  { id: 'Admin', name: 'Admin', description: 'Users, Roles, Audit Logs' },
];

export default function HRRolesPage() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleEmail, setRoleEmail] = useState('');
  const [rolePassword, setRolePassword] = useState('');
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  
  const customRolesRaw = useERPStore((s: any) => s.state?.customRoles);
  const customRoles = customRolesRaw || [];
  const addCustomRole = useERPStore((s: any) => s.customRolesActions?.addCustomRole);
  const updateCustomRole = useERPStore((s: any) => s.customRolesActions?.updateCustomRole);
  const deleteCustomRole = useERPStore((s: any) => s.customRolesActions?.deleteCustomRole);
  
  const showToast = useNotificationStore((s: any) => s.showToast);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleOpenModal = (role: any = null) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDesc(role.description || '');
      setRoleEmail(role.email || '');
      setRolePassword(role.password || '');
      setSelectedPanels(role.allowedPanels || []);
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDesc('');
      setRoleEmail('');
      setRolePassword('');
      setSelectedPanels([]);
    }
    setIsModalOpen(true);
  };

  const togglePanel = (panelId: string) => {
    if (selectedPanels.includes(panelId)) {
      setSelectedPanels(selectedPanels.filter(id => id !== panelId));
    } else {
      setSelectedPanels([...selectedPanels, panelId]);
    }
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      if (showToast) showToast('Role Name is required');
      return;
    }
    if (selectedPanels.length === 0) {
      if (showToast) showToast('Select at least one panel');
      return;
    }

    const payload = {
      name: roleName.trim(),
      description: roleDesc.trim(),
      email: roleEmail.trim(),
      password: rolePassword,
      allowedPanels: selectedPanels
    };

    if (editingRole) {
      updateCustomRole(editingRole.id, payload);
      if (showToast) showToast('Role updated successfully');
    } else {
      addCustomRole(payload);
      if (showToast) showToast('Role created successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this role? Users assigned to this role will lose access.')) {
      deleteCustomRole(id);
      if (showToast) showToast('Role deleted successfully');
    }
  };

  return (
    <div className="erp-page-container fade-in">
      <div className="erp-header-card mb-6">
        <div className="erp-header-title-group">
          <h1 className="erp-header-title"><Shield className="inline-icon mr-2 text-[#4f46e5]" /> Role & Panel Access</h1>
          <p className="erp-header-subtitle">Create roles and assign them access to entire application panels/modules</p>
        </div>
        <div className="erp-page-actions">
          <button className="erp-btn erp-btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> Create New Role
          </button>
        </div>
      </div>

      <div className="erp-panel-grid">
        {customRoles.length === 0 && (
          <div className="empty-state">
            <Shield size={48} className="text-[#8893A7]" />
            <h3 className="text-xl text-[#24345C] font-bold">No Custom Roles Found</h3>
            <p className="text-[#5E6B82] mb-2">Create a custom role to grant cross-panel access.</p>
            <button className="erp-btn erp-btn-primary" onClick={() => handleOpenModal()}>Create Your First Role</button>
          </div>
        )}

        {customRoles.map((role: any) => (
          <div key={role.id} className="relative overflow-hidden group p-6 rounded-2xl bg-white border border-[#DCE5F0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-column">
                <h3 className="text-lg font-bold text-[#24345C] flex-row">
                  <Shield size={16} className="text-blue-600" />
                  {role.name}
                </h3>
                <p className="text-sm text-[#5E6B82]">{role.description || 'No description provided'}</p>
              </div>
              <div className="flex-row opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(role)} className="p-1.5 bg-[#F5FAFE] hover:bg-[#DCE5F0] rounded-md text-[#24345C] transition-colors" title="Edit Role">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(role.id)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md text-red-600 transition-colors" title="Delete Role">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-[#8893A7] uppercase tracking-wider mb-3">Allowed Panels</h4>
              <div className="flex flex-wrap gap-2">
                {role.allowedPanels?.map((panel: string) => (
                  <span key={panel} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                    <LayoutGrid size={12} className="mr-1.5 opacity-70" />
                    {panel}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#DCE5F0] flex justify-between items-center">
              <div className="text-xs text-[#8893A7]">ID: {role.id}</div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#F5FAFE] border border-[#DCE5F0] flex items-center justify-center text-[10px] text-[#24345C]"><Users size={10} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content">
            <div className="erp-modal-header">
              <h2 className="erp-modal-title">
                {editingRole ? <Pencil className="text-[#4f46e5]" size={20} /> : <Plus className="text-green-600" size={20} />}
                {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="erp-modal-close">
                <X size={24} />
              </button>
            </div>
            
            <div className="erp-modal-body">
              <div className="erp-form-grid">
                <div className="erp-form-group">
                  <label className="erp-form-label">Role Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="erp-form-input"
                    placeholder="e.g. Regional Manager"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Description</label>
                  <input
                    type="text"
                    className="erp-form-input"
                    placeholder="Brief description of this role"
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Login Email</label>
                  <input
                    type="email"
                    className="erp-form-input"
                    placeholder="e.g. user@himalayaerp.com"
                    value={roleEmail}
                    onChange={(e) => setRoleEmail(e.target.value)}
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-form-label">Login Password</label>
                  <input
                    type="password"
                    className="erp-form-input"
                    placeholder="••••••••"
                    value={rolePassword}
                    onChange={(e) => setRolePassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="erp-modal-title" style={{marginBottom: '4px'}}>
                  <LayoutGrid className="text-[#8893A7]" size={18} />
                  Panel Access Configuration
                </h3>
                <p className="erp-form-hint" style={{marginBottom: '16px'}}>Select which application modules this role can access. The navigation menu will automatically stitch these panels together.</p>
                
                <div className="erp-panel-grid">
                  {AVAILABLE_PANELS.map(panel => {
                    const isSelected = selectedPanels.includes(panel.id);
                    return (
                      <div
                        key={panel.id}
                        onClick={() => togglePanel(panel.id)}
                        className={`erp-panel-card ${isSelected ? 'active' : ''}`}
                      >
                        <div className="erp-panel-header">
                          <div className="erp-panel-title">{panel.name}</div>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? '#4f46e5' : '#F5FAFE',
                            border: isSelected ? 'none' : '1px solid #DCE5F0',
                            color: '#ffffff'
                          }}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className="erp-panel-desc">{panel.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="erp-modal-footer">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="erp-btn erp-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="erp-btn erp-btn-primary"
              >
                <Check size={16} />
                {editingRole ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
