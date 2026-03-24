'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    if (isAuthenticated && user) {
      checkAdminStatus();
    }
  }, [isAuthenticated, loading, user, router]);

  const checkAdminStatus = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data?.user || response.user || user;
      
      // Check if user is admin: email contains 'admin' or has is_admin flag
      const adminCheck = 
        (userData?.email && userData.email.toLowerCase().includes('admin')) ||
        userData?.is_admin === true;
      
      setIsAdmin(adminCheck);
      
      if (!adminCheck) {
        // Not an admin, redirect to login
        router.push('/login?error=admin_required');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/login?error=auth_failed');
    } finally {
      setCheckingAdmin(false);
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

