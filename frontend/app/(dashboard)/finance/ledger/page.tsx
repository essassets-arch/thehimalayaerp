'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function CustomerLedgerPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/sales/customers');
      return res.data;
    }
  });

  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ['ledger', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const res = await axios.get(`/api/backend/finance/ledger/${selectedCustomerId}`);
      return res.data;
    },
    enabled: !!selectedCustomerId
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground">Statement of Account for Customers</p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer to view ledger" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCustomerId && ledgerData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{ledgerData.customer?.companyName}</CardTitle>
                <CardDescription>Statement of Account</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className={`text-2xl font-bold ${ledgerData.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  ₹{Math.abs(ledgerData.balance).toFixed(2)} {ledgerData.balance > 0 ? '(Dr)' : '(Cr)'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ledgerData.entries?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No ledger entries found for this customer.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.entries.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {entry.type === 'INVOICE' && <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 flex w-fit items-center"><ArrowUpRight className="mr-1 h-3 w-3"/> Invoice</Badge>}
                        {entry.type === 'PAYMENT' && <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 flex w-fit items-center"><ArrowDownLeft className="mr-1 h-3 w-3"/> Payment</Badge>}
                        {entry.type === 'PAYMENT_BOUNCED' && <Badge variant="destructive">Bounced</Badge>}
                      </TableCell>
                      <TableCell className="text-sm">{entry.description}</TableCell>
                      <TableCell className="text-right text-amber-600 font-medium">
                        {Number(entry.debit) > 0 ? Number(entry.debit).toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {Number(entry.credit) > 0 ? Number(entry.credit).toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {Math.abs(entry.balance).toFixed(2)} {entry.balance > 0 ? 'Dr' : 'Cr'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
