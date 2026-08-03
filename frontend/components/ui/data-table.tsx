import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
  searchKey?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = "No results." }: DataTableProps<T>) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, i) => (
              <TableRow key={i}>
                {columns.map((col, j) => (
                  <TableCell key={j}>
                    {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
