'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  CreditCard,
  Users,
  Settings,
  MessageCircle
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['requester', 'manager', 'store', 'finance', 'admin'] },
  { name: 'Requisitions', href: '/requisitions', icon: FileText, roles: ['requester', 'manager', 'admin'] },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, roles: ['manager', 'store', 'admin'] },
  { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['finance', 'admin'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['finance', 'admin'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageCircle, roles: ['requester', 'manager', 'store', 'finance', 'admin'] },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = (session?.user as any)?.role;

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}