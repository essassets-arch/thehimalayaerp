'use client';

import React, { useState } from 'react';
import { UserPlus, Send } from 'lucide-react';
import '@/components/erp-premium-ui.css';

export default function RecruitmentRequestPage() {
  const [requests, setRequests] = useState([
    { id: 'RR-101', role: 'CNC Machine Operator', department: 'Production Shift A', vacancies: 3, priority: 'HIGH', status: 'FORWARDED_TO_HR', requestedAt: '2026-07-18' },
    { id: 'RR-102', role: 'Senior QC Inspector', department: 'Quality Assurance', vacancies: 1, priority: 'URGENT', status: 'HR_PROCESSING', requestedAt: '2026-07-20' }
  ]);

  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Production');
  const [vacancies, setVacancies] = useState('1');
  const [priority, setPriority] = useState('HIGH');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    const newReq = {
      id: `RR-${Date.now().toString().slice(-3)}`,
      role,
      department,
      vacancies: Number(vacancies),
      priority,
      status: 'FORWARDED_TO_HR',
      requestedAt: new Date().toISOString().split('T')[0]
    };
    setRequests([newReq, ...requests]);
    setRole('');
    alert('Recruitment request created and forwarded directly to HR!');
  };

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <UserPlus style={{ width: 24, height: 24, color: '#4f46e5' }} />
            Plant Head → Recruitment Requests
          </h2>
          <p className="erp-header-subtitle">Raise manpower requirement indents directly routed to the HR department.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Form Card */}
        <form onSubmit={handleSubmit} className="erp-table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#24345C', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Send style={{ width: 16, height: 16, color: '#4f46e5' }} />
            Raise New Recruitment Indent
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Designation / Role Name *</label>
            <input type="text" required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Lathe Operator" className="erp-search-input" style={{ paddingLeft: '12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="erp-search-input" style={{ paddingLeft: '12px' }}>
              <option value="Production">Production</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Store & Logistics">Store & Logistics</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Number of Vacancies</label>
            <input type="number" min="1" value={vacancies} onChange={e => setVacancies(e.target.value)} className="erp-search-input" style={{ paddingLeft: '12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Priority Level</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="erp-search-input" style={{ paddingLeft: '12px' }}>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <button type="submit" className="erp-btn erp-btn-primary" style={{ marginTop: '8px', height: '40px' }}>
            Submit & Forward to HR
          </button>
        </form>

        {/* History Table */}
        <div className="erp-table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#24345C', marginBottom: '16px', margin: 0 }}>Submitted Requests History</h3>
          <div className="erp-table-responsive" style={{ marginTop: '14px' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Vacancies</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{r.id}</td>
                    <td style={{ fontWeight: 700, color: '#24345C' }}>{r.role}</td>
                    <td style={{ color: '#475569' }}>{r.department}</td>
                    <td style={{ fontWeight: 800, color: '#24345C' }}>{r.vacancies}</td>
                    <td style={{ fontWeight: 800, color: '#b45309' }}>{r.priority}</td>
                    <td><span className="erp-badge erp-badge-blue">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
