import { SalarySlipPageView } from '@/components/payroll/SalarySlipPageView';

export const metadata = {
  title: 'Official Salary Slip & CTC Statement | HR Management',
  description: 'View and print employee salary slip with Himalaya official branding.',
};

export default async function ViewSalaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SalarySlipPageView structureId={id} />;
}
