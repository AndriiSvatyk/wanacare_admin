'use client';

import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
        <p className="text-gray-600 mb-8">
          Use the sidebar to the left to create, edit or delete content.
        </p>
        <button
          onClick={handleLogout}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </MainLayout>
  );
}



