import LeftSidebar from '../../components/LeftSidebar';
import { getUser } from '../../actions/auth';
import { redirect } from 'next/navigation';

export default async function MainLayout({ children }) {
  const response = await getUser();
  if (!response?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <LeftSidebar />
      <div className="flex-1 min-h-screen">{children}</div>
    </div>
  );
}