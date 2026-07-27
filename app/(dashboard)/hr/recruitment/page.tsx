'use client';

import React, { useState } from 'react';
import { Users, Send, CheckCircle2, UserPlus, Clock } from 'lucide-react';
import { PageSearchInput, StandardActionButtons } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function HRRecruitmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([
    { id: 'RR-101', role: 'CNC Machine Operator', department: 'Production Shift A', vacancies: 3, priority: 'HIGH', requestedBy: 'Plant Head (Vikram Singh)', status: 'HR_PROCESSING', candidateCount: 5 },
    { id: 'RR-102', role: 'Senior QC Inspector', department: 'Quality Assurance', vacancies: 1, priority: 'URGENT', requestedBy: 'Plant Head (Vikram Singh)', status: 'OPEN', candidateCount: 2 }
  ]);

  const handleUpdateStatus = (id: string, status: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    alert(`Recruitment request ${id} updated to ${status}!`);
  };

  const filtered = requests.filter(r => 
    r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="erp-page-container">
      
      {/* Header Card */}
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <Users style={{ width: 24, height: 24, color: '#4f46e5' }} />
            HR → Recruitment Requests & Indents
          </h2>
          <p className="erp-header-subtitle">
            Receive and process hiring requisitions submitted by Plant Head and department managers.
          </p>
        </div>

        <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search role, department..." />
      </div>

      {/* Table Section */}
      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Indent ID</th>
                <th>Requested Role</th>
                <th>Department</th>
                <th>Requested By</th>
                <th>Vacancies</th>
                <th>Priority</th>
                <th>Candidates Sourced</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{r.id}</td>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{r.role}</td>
                  <td style={{ color: '#475569' }}>{r.department}</td>
                  <td style={{ color: '#334155' }}>{r.requestedBy}</td>
                  <td style={{ fontWeight: 800, color: '#24345C' }}>{r.vacancies}</td>
                  <td style={{ fontWeight: 800, color: r.priority === 'URGENT' ? '#b91c1c' : '#b45309' }}>{r.priority}</td>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{r.candidateCount} Candidates</td>
                  <td>
                    <span className={`erp-badge ${r.status === 'FULFILLED' ? 'erp-badge-green' : 'erp-badge-blue'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleUpdateStatus(r.id, 'INTERVIEW_SCHEDULED')} 
                        className="erp-btn erp-btn-sm erp-btn-primary"
                        type="button"
                      >
                        Schedule Interviews
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(r.id, 'FULFILLED')} 
                        className="erp-btn erp-btn-sm erp-btn-success"
                        type="button"
                      >
                        Mark Fulfilled
                      </button>
                      <StandardActionButtons compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
