'use client';

import React, { useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_midnight.min.css';

export default function TabulatorTable({
  data = [],
  columns = [],
  paginationSize = 15,
  onEdit,
  onDelete,
  isLoading = false,
  placeholder = "No records found"
}) {
  const tableRef = useRef(null);
  const tabulatorInstance = useRef(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // Build Tabulator columns with custom formatters for rich rendering and action handlers
    const formattedColumns = columns.map(col => {
      const tabCol = { ...col };

      // Handle custom React/HTML cell formatters
      if (col.field === 'product_name') {
        tabCol.formatter = (cell) => {
          const rowData = cell.getRow().getData();
          const name = rowData.product_name || rowData.name || '—';
          const variant = rowData.variant_details ? `<div style="font-size: 11px; color: #8893A7; font-weight: 400; margin-top: 2px;">${rowData.variant_details}</div>` : '';
          return `<div style="font-weight: 600; color: #F5FAFE;">${name}${variant}</div>`;
        };
      }

      if (col.field === 'product_type_family') {
        tabCol.formatter = (cell) => {
          const rowData = cell.getRow().getData();
          const type = rowData.product_type || '—';
          const family = rowData.product_family || '—';
          return `<div><div style="font-size: 13px; color: #E2E8F0;">${type}</div><div style="font-size: 11px; color: #8893A7;">${family}</div></div>`;
        };
      }

      if (col.field === 'gst_hsn') {
        tabCol.formatter = (cell) => {
          const rowData = cell.getRow().getData();
          const gst = rowData.gst_rate ?? 18;
          const hsn = rowData.hsn_sac_code ? ` / ${rowData.hsn_sac_code}` : '';
          return `<span style="color: #CBD5E1;">${gst}%${hsn}</span>`;
        };
      }

      if (col.field === 'dispatch_category') {
        tabCol.formatter = (cell) => {
          const val = String(cell.getValue() || '').trim().toUpperCase();
          if (val === 'DISPATCH 2' || val === 'D2') {
            return `<span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3);">D2</span>`;
          }
          if (val === 'DISPATCH 1' || val === 'D1') {
            return `<span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: rgba(99, 102, 241, 0.15); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.3);">D1</span>`;
          }
          return `<span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #94A3B8; background: rgba(255,255,255,0.05);">—</span>`;
        };
      }

      if (col.field === 'actions') {
        tabCol.formatter = () => {
          return `
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="tabulator-action-edit" title="Edit" style="background: none; border: none; color: #818CF8; cursor: pointer; padding: 2px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="tabulator-action-delete" title="Delete" style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 2px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          `;
        };

        tabCol.cellClick = (e, cell) => {
          const target = e.target.closest('button');
          if (!target) return;

          const rowData = cell.getRow().getData();
          if (target.classList.contains('tabulator-action-edit') && onEdit) {
            onEdit(rowData);
          } else if (target.classList.contains('tabulator-action-delete') && onDelete) {
            onDelete(rowData.id);
          }
        };
      }

      return tabCol;
    });

    tabulatorInstance.current = new Tabulator(tableRef.current, {
      data,
      columns: formattedColumns,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: paginationSize,
      paginationSizeSelector: [10, 20, 50, 100, true],
      movableColumns: true,
      resizableColumnFit: true,
      placeholder: isLoading ? 'Loading products...' : placeholder,
      rowHeight: 48,
    });

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
        tabulatorInstance.current = null;
      }
    };
  }, []); // Initialize table once

  // Update data when data prop changes
  useEffect(() => {
    if (tabulatorInstance.current) {
      tabulatorInstance.current.setData(data);
    }
  }, [data]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div 
        ref={tableRef} 
        className="tabulator-custom-theme" 
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0F172A',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      />
      <style jsx global>{`
        .tabulator-custom-theme {
          background-color: #0F172A !important;
          color: #F8FAFC !important;
          font-family: inherit !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .tabulator-custom-theme .tabulator-header {
          background-color: #1E293B !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #94A3B8 !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
        }
        .tabulator-custom-theme .tabulator-header .tabulator-col {
          background-color: #1E293B !important;
          border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .tabulator-custom-theme .tabulator-row {
          background-color: #0F172A !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: background-color 0.15s ease !important;
        }
        .tabulator-custom-theme .tabulator-row:hover {
          background-color: rgba(99, 102, 241, 0.08) !important;
        }
        .tabulator-custom-theme .tabulator-row.tabulator-row-even {
          background-color: #131D31 !important;
        }
        .tabulator-custom-theme .tabulator-cell {
          padding: 12px 16px !important;
          border-right: 1px solid rgba(255, 255, 255, 0.03) !important;
          display: flex !important;
          align-items: center !important;
        }
        .tabulator-custom-theme .tabulator-footer {
          background-color: #1E293B !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #CBD5E1 !important;
          padding: 8px 16px !important;
        }
        .tabulator-custom-theme .tabulator-page {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #F8FAFC !important;
          border-radius: 6px !important;
          padding: 4px 10px !important;
          margin: 0 2px !important;
        }
        .tabulator-custom-theme .tabulator-page.active {
          background: #6366F1 !important;
          color: #FFFFFF !important;
          border-color: #6366F1 !important;
        }
        .tabulator-custom-theme select {
          background: #0F172A !important;
          color: #F8FAFC !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
        }
      `}</style>
    </div>
  );
}
