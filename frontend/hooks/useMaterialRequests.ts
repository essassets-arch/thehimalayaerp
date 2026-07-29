'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '@/lib/backendFetch';

export interface MaterialRequestItemRecord {
  id: string;
  materialId: string;
  material: string;
  materialName: string;
  requestedQty: number;
  approvedQty: number;
  issuedQty: number;
  unit: string;
  [key: string]: unknown;
}

export interface MaterialRequestRecord {
  id: string;
  requestNo: string;
  status: string;
  items: MaterialRequestItemRecord[];
  [key: string]: unknown;
}

type CreateMaterialRequestInput = Record<string, unknown>;
type ApprovalInput = { id: string; items: MaterialRequestItemRecord[] };
type StatusInput = {
  id: string;
  status: string;
  items?: MaterialRequestItemRecord[];
  metadata?: Record<string, unknown>;
};
const key = ['material-requests'];

export function useMaterialRequests() {
  return useQuery<MaterialRequestRecord[]>({
    queryKey: key,
    queryFn: () => backendFetch('/api/backend/material-requests'),
  });
}

export function useCreateMaterialRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialRequestInput) => backendFetch('/api/backend/material-requests', {
      method: 'POST',
      body: data,
      idempotencyKey: `material-request-create-${crypto.randomUUID()}`,
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export function useApproveMaterialRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: ApprovalInput) => backendFetch(`/api/backend/material-requests/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH', body: { items },
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export function useRejectMaterialRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backendFetch(`/api/backend/material-requests/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateMaterialRequestStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, items, metadata }: StatusInput) =>
      backendFetch(`/api/backend/material-requests/${encodeURIComponent(id)}/status`, {
        method: 'PATCH', body: { status, items, metadata },
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}
