import MyProfileView from '@/shared/components/MyProfileView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BackOfficeProfilePage() {
  return <MyProfileView />;
}
