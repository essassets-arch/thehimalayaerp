'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, User } from 'lucide-react';

export default function SalespersonPerformancePreview({ salespersons = [] }) {
  const router = useRouter();

  const formatLakh = (val) => {
    if (val === null || val === undefined || val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const topSalespersons = salespersons.slice(0, 5);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '20px',
        marginTop: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>
            Sales Team Performance
          </h4>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
            Top active salespersons by sales value & collection efficiency
          </p>
        </div>

        <button
          onClick={() => router.push('/finance/sales-analytics')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            color: '#38BDF8',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>View All Salespersons</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            minWidth: '850px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '12.5px',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#64748B',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '10px 12px', fontWeight: '700' }}>Salesperson</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Leads</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Quotations</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Orders</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'right' }}>Sales Value</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'right' }}>Collected</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'right' }}>Outstanding</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'right' }}>Overdue</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Conversion</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Last Activity</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>View</th>
            </tr>
          </thead>
          <tbody>
            {topSalespersons.map((sp, idx) => {
              const conversion = sp.collectionEfficiency !== undefined
                ? `${sp.collectionEfficiency}%`
                : sp.quotationToOrderRate !== undefined
                ? `${sp.quotationToOrderRate}%`
                : 'N/A';

              const lastAct = sp.lastActivity
                ? new Date(sp.lastActivity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                : 'N/A';

              return (
                <tr
                  key={sp.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38BDF8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '800',
                          flexShrink: 0,
                        }}
                      >
                        {sp.salesperson ? sp.salesperson.charAt(0).toUpperCase() : <User size={14} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#F1F5F9' }}>
                          {sp.salesperson || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {sp.employeeId || sp.email || 'Sales'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center', color: '#CBD5E1', fontWeight: '600' }}>
                    {sp.totalLeads ?? 0}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#CBD5E1', fontWeight: '600' }}>
                    {sp.quotationsCreated ?? 0}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#CBD5E1', fontWeight: '600' }}>
                    {sp.ordersGenerated ?? 0}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#34D399' }}>
                    {formatLakh(sp.confirmedSalesValue)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#60A5FA' }}>
                    {formatLakh(sp.collectedAmount)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#FBBF24' }}>
                    {formatLakh(sp.outstandingAmount)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#F87171' }}>
                    {formatLakh(sp.overdueAmount)}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#C084FC' }}>
                    {conversion}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center', color: '#94A3B8', fontSize: '11.5px' }}>
                    {lastAct}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => router.push(`/finance/sales-analytics/${sp.id}`)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38BDF8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>View</span>
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {topSalespersons.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  No salesperson performance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
