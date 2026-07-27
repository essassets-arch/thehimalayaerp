import React from 'react';
import { Phone, Check, Calendar, AlertTriangle, FileText, FlaskConical, Layers, CreditCard, Box, Wrench } from 'lucide-react';

const TYPE_CONFIG = {
  Lead: {
    icon: Phone,
    badgeClass: 'badge-follow-up', // Orange/yellow
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)'
  },
  Sample: {
    icon: FlaskConical,
    badgeClass: 'badge-sent', // Light blue
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.08)'
  },
  Quotation: {
    icon: FileText,
    badgeClass: 'badge-new', // Blue
    color: '#1e40af',
    bgColor: 'rgba(30, 64, 175, 0.08)'
  },
  Order: {
    icon: Box,
    badgeClass: 'badge-confirmed', // Indigo
    color: '#4338ca',
    bgColor: 'rgba(67, 56, 202, 0.08)'
  },
  Production: {
    icon: Wrench,
    badgeClass: 'badge-processing', // Dark yellow/orange
    color: '#b45309',
    bgColor: 'rgba(180, 83, 9, 0.08)'
  },
  Payment: {
    icon: CreditCard,
    badgeClass: 'badge-outstanding', // Outstanding color
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.08)'
  }
};

export default function TaskCard({ task, onDone, onReschedule }) {
  const config = TYPE_CONFIG[task.type] || {
    icon: Layers,
    badgeClass: 'badge-pending',
    color: '#4b5563',
    bgColor: 'rgba(75, 85, 99, 0.08)'
  };
  
  const IconComponent = config.icon;
  const isOverdue = task.status === 'Overdue';
  
  const formatAmount = (val) => {
    if (!val) return null;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className={`app-card task-card ${isOverdue ? 'task-card-overdue' : ''}`}
      style={{
        padding: '10px 14px',
        borderRadius: '14px',
        border: '1px solid var(--color-border)',
        borderLeft: isOverdue ? '4px solid #ef4444' : `4px solid ${config.color}`,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: isOverdue 
          ? '0 4px 20px rgba(239, 68, 68, 0.05)' 
          : 'var(--shadow-card)',
        transition: 'var(--transition-smooth)',
        position: 'relative'
      }}
    >
      {/* Top Tag & Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span 
          className={`badge ${config.badgeClass}`}
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: '800',
            fontSize: '9.5px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '3px 6px'
          }}
        >
          <IconComponent size={9} style={{ strokeWidth: 3 }} />
          {task.type}
        </span>
        
        {isOverdue && (
          <span 
            className="badge badge-overdue animate-pulse"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '800',
              fontSize: '9.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '3px 6px'
            }}
          >
            <AlertTriangle size={9} style={{ strokeWidth: 3 }} />
            Overdue
          </span>
        )}
      </div>

      {/* Main Task Description */}
      <div>
        <h3 
          style={{ 
            fontSize: '14px', 
            fontWeight: '800', 
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.3px',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{task.clientName}</span>
          {task.amount > 0 && (
            <span style={{ fontSize: '13px', fontWeight: '800', color: config.color }}>
              {formatAmount(task.amount)}
            </span>
          )}
        </h3>
        <p 
          style={{ 
            fontSize: '12px', 
            color: 'var(--color-text-secondary)', 
            lineHeight: '1.35',
            fontWeight: '500',
            whiteSpace: 'pre-wrap',
            margin: '0'
          }}
        >
          {task.notes}
        </p>
      </div>

      {/* Date row */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          fontSize: '10.5px', 
          color: isOverdue ? '#ef4444' : 'var(--color-text-muted)',
          fontWeight: '700'
        }}
      >
        <Calendar size={11} />
        <span>Action Date: {task.followUpDate}</span>
      </div>

      {/* Action Buttons */}
      <div 
        className="task-actions"
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '6px', 
          marginTop: '0px', 
          borderTop: '1px solid #f1f5f9', 
          paddingTop: '6px' 
        }}
      >

        <button 
          type="button"
          className="btn-small btn-outline-small task-card-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px',
            borderColor: 'var(--color-border)',
            fontWeight: '700',
            padding: '5px 10px',
            minWidth: '85px',
            flex: 'none'
          }}
          onClick={() => onReschedule(task)}
        >
          <Calendar size={10} strokeWidth={2.5} />
          Reschedule
        </button>

        <button 
          type="button"
          className="btn-small btn-primary-small task-card-btn"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px',
            background: 'var(--color-lime-brand)',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontWeight: '800',
            boxShadow: 'none',
            padding: '5px 10px',
            minWidth: '85px',
            flex: 'none'
          }}
          onClick={() => onDone(task)}
        >
          <Check size={10} strokeWidth={3} />
          Done
        </button>
      </div>
    </div>
  );
}
