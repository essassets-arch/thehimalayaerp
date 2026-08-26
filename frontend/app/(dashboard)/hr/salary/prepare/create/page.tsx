import { CreateSalaryStructureView } from '@/components/payroll/CreateSalaryStructureView';

export const metadata = {
  title: 'Create Employee Salary Structure & CTC | HR Management',
  description: 'Formulate and prepare employee salary structure and CTC breakdown.',
};

export default function CreateSalaryPage() {
  return <CreateSalaryStructureView mode="create" />;
}
