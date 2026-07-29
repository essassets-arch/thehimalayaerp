import { backendFetch } from '@/lib/backendFetch';

export type RecruitmentRequest = {
  id: string;
  indentNumber: string;
  designation: string;
  department: string;
  vacancies: number;
  priority: string;
  employmentType?: string;
  requiredExperience?: string;
  requiredSkills?: string;
  reasonForHiring: string;
  jobDescription?: string;
  requiredByDate?: string;
  requestedByName: string;
  requestedByRole: string;
  positionsFilled: number;
  candidatesSourced: number;
  status: string;
  submittedAt: string;
  version: number;
  hrRemarks?: string;
  correctionReason?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  fulfilledBy?: string;
  rejectedAt?: string;
  fulfilledAt?: string;
  candidates?: RecruitmentCandidate[];
  interviews?: RecruitmentInterview[];
  timeline?: RecruitmentTimeline[];
};

export type RecruitmentCandidate = {
  id: string;
  candidateNumber: string;
  name: string;
  phone?: string;
  email?: string;
  experience?: string;
  currentCompany?: string;
  expectedSalary?: string | number;
  source?: string;
  status: string;
  joiningDate?: string;
  remarks?: string;
};

export type RecruitmentInterview = {
  id: string;
  candidateId: string;
  interviewDate: string;
  interviewMode: string;
  interviewLocation?: string;
  meetingLink?: string;
  interviewRound?: string;
  status: string;
};

export type RecruitmentTimeline = {
  id: string;
  action: string;
  performedByName: string;
  performedByRole: string;
  remarks?: string;
  createdAt: string;
};

const base = '/api/backend/hr/recruitment-requests';
const key = () => crypto.randomUUID();

export const recruitmentService = {
  list: (search = '', status = '') =>
    backendFetch<RecruitmentRequest[]>(`${base}?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`, { cacheTtlMs: 0 }),
  mine: () => backendFetch<RecruitmentRequest[]>(`${base}/my-requests`, { cacheTtlMs: 0 }),
  get: (id: string) => backendFetch<RecruitmentRequest>(`${base}/${id}`, { cacheTtlMs: 0 }),
  create: (body: unknown) => backendFetch<RecruitmentRequest>(base, { method: 'POST', body, idempotencyKey: key() }),
  update: (id: string, body: unknown) => backendFetch<RecruitmentRequest>(`${base}/${id}`, { method: 'PATCH', body }),
  action: (id: string, action: string, body: unknown = {}) =>
    backendFetch<RecruitmentRequest>(`${base}/${id}/${action}`, { method: 'POST', body, idempotencyKey: key() }),
  addCandidate: (id: string, body: unknown) =>
    backendFetch<RecruitmentCandidate>(`${base}/${id}/candidates`, { method: 'POST', body, idempotencyKey: key() }),
  updateCandidate: (id: string, body: unknown) =>
    backendFetch<RecruitmentCandidate>(`/api/backend/hr/recruitment-candidates/${id}`, { method: 'PATCH', body }),
  candidateAction: (id: string, action: 'select' | 'reject', body: unknown = {}) =>
    backendFetch<RecruitmentCandidate>(`/api/backend/hr/recruitment-candidates/${id}/${action}`, { method: 'POST', body, idempotencyKey: key() }),
  addInterview: (id: string, body: unknown) =>
    backendFetch<RecruitmentInterview>(`${base}/${id}/interviews`, { method: 'POST', body, idempotencyKey: key() }),
  updateInterview: (id: string, body: unknown) =>
    backendFetch<RecruitmentInterview>(`/api/backend/hr/recruitment-interviews/${id}`, { method: 'PATCH', body }),
  interviewAction: (id: string, action: 'complete' | 'reschedule' | 'cancel', body: unknown = {}) =>
    backendFetch<RecruitmentInterview>(`/api/backend/hr/recruitment-interviews/${id}/${action}`, { method: 'POST', body, idempotencyKey: key() }),
};
