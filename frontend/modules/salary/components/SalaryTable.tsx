import React from 'react';

export interface SalaryColumn<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface SalaryTableProps<T> {
  columns: SalaryColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function SalaryTable<T>({ columns, data, emptyMessage = "No results found." }: SalaryTableProps<T>) {
  return (
    <div className="salary-table-wrapper">
      <table className="salary-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => {
                  let content: React.ReactNode = null;
                  if (col.cell) {
                    content = col.cell(row);
                  } else if (col.accessorKey) {
                    content = row[col.accessorKey] as any;
                  }
                  
                  return <td key={colIndex}>{content}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
