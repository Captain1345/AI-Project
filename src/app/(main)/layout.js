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
      <aside className="w-[260px] h-screen bg-white border-r flex-shrink-0 sticky top-0 left-0 z-20">
        <LeftSidebar />
      </aside>
      <main className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
        {children}
      </main>
    </div>
  );
}