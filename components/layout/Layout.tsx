'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        className="fixed top-0 left-0 right-0 z-50" 
        onMenuClick={toggleSidebar}
      />
      <div className="flex flex-1 pt-16">
        <Sidebar 
          className="lg:fixed lg:left-0 lg:top-16 lg:bottom-0"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}