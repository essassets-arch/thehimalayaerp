import { CreateSalaryStructureView } from '@/components/payroll/CreateSalaryStructureView';

export const metadata = {
  title: 'Edit Employee Salary Structure & CTC | HR Management',
  description: 'Update and recalculate employee salary structure and CTC breakdown.',
};

export default async function EditSalaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreateSalaryStructureView mode="edit" structureId={id} />;
}
