'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, Building2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { backendFetch } from '@/lib/backendFetch';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = async () => {
    try {
      const data = await backendFetch(`/api/backend/crm/leads/${params.id}`);
      setLead(data);
    } catch (e) {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {lead.companyName}
            <Badge variant="outline" className="bg-slate-100">{lead.workflowState?.name}</Badge>
          </h2>
          <p className="text-muted-foreground">{lead.leadNumber} • Created on {new Date(lead.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{lead.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{lead.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{lead.phone || 'N/A'}</span>
            </div>

            {lead.convertedCustomerId && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Converted to Customer
                </div>
                <div className="text-xs text-green-700 mt-1">Customer ID: {lead.convertedCustomerId}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Button variant="outline" size="sm">Add Activity</Button>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
              {lead.activities?.map((activity: any) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">{activity.activityType}</span>
                    <span className="text-slate-500">{new Date(activity.createdAt).toLocaleString()}</span>
                    {activity.notes && (
                      <p className="mt-2 bg-slate-50 p-3 rounded-md text-slate-700 border border-slate-100">
                        {activity.notes}
                      </p>
                    )}
                    {activity.scheduledAt && (
                      <div className="mt-2 flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs w-fit">
                        <Clock className="h-3 w-3" /> Scheduled for {new Date(activity.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!lead.activities || lead.activities.length === 0) && (
                <div className="text-sm text-slate-500">No activities yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
