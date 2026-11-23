import React from 'react';
import { filterAndRankBySearch } from '../utils/smartSearch';

const formatCellValue = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  if (React.isValidElement(val)) return val;
  if (typeof val === 'object') {
    return val.name || val.label || val.title || val.code || String(val.id || '');
  }
  return String(val);
};

export default function DataTable({ 
  columns = [], 
  data = [], 
  searchQuery = '', 
  searchField = '', 
  actions, 
  onRowClick,
  emptyMessage = 'No matching records found.',
  className = '',
  scrollMode = false
}) {
  // Smart multi-token, dimension-aware & typo-tolerant filtering across specified fields
  const fieldList = searchField
    ? searchField.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const filteredData = filterAndRankBySearch(
    data || [],
    (item) => {
      if (fieldList.length === 0) return [];
      return fieldList.map((fieldPath) => {
        const fields = fieldPath.split('.');
        let targetValue = item;
        for (const field of fields) {
          if (targetValue && targetValue[field] !== undefined) {
            targetValue = targetValue[field];
          } else {
            targetValue = '';
          }
        }
        return formatCellValue(targetValue);
      });
    },
    fieldList.length > 0 ? searchQuery : '',
  );

  return (
    <div className={`crm-table-container erp-table-responsive ${scrollMode ? 'scroll-mode' : ''}`}>
      <table className={`crm-table ${scrollMode ? 'erp-table-scroll' : 'responsive-table'} ${className}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ textAlign: col.align || 'left', whiteSpace: col.nowrap ? 'nowrap' : 'normal' }}>
                {col.header}
              </th>
            ))}
            {actions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            filteredData.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIdx) => {
                  let value = '';
                  const acc = col.accessor || col.accessorKey;
                  if (!col.render && !col.cell) {
                    if (typeof acc === 'function') {
                      value = acc(row);
                    } else if (typeof acc === 'string') {
                      const fields = acc.replace(/\[(\d+)\]/g, '.$1').split('.');
                      let temp = row;
                      for (const f of fields) {
                        if (temp && temp[f] !== undefined) {
                          temp = temp[f];
                        } else {
                          temp = undefined;
                          break;
                        }
                      }
                      value = temp !== undefined ? temp : '';
                    }
                    if (acc === 'id' && !value) {
                      value = row.workOrderId || row.workOrderNo || row.orderNo || row.id || '';
                    }
                    if (acc === 'products[0].productName' && !value) {
                      value = row.productName || (typeof row.products === 'string' ? row.products : '') || row.products?.[0]?.productName || 'Custom Engineered Product';
                    }
                    if (acc === 'production.outputQuantity' && !value) {
                      value = row.production?.producedQty || row.producedQty || row.production?.outputQuantity || row.quantity || 0;
                    }
                  }
                  
                  const rawResult = col.render ? col.render(row) : (col.cell ? col.cell({ row: { original: row }, getValue: () => value }) : value);
                  const renderedCell = formatCellValue(rawResult);

                  return (
                    <td 
                      key={colIdx} 
                      data-label={col.header} 
                      style={{ 
                        textAlign: col.align || 'left',
                        whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                      }}
                    >
                      {renderedCell}
                    </td>
                  );
                })}
                {actions && (
                  <td data-label="Actions" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="action-btn-group" style={{ flexWrap: 'nowrap' }}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
