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
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['requester', 'manager', 'store', 'finance', 'admin'] },
  { name: 'Requisitions', href: '/requisitions', icon: FileText, roles: ['requester', 'manager', 'admin'] },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, roles: ['manager', 'store', 'admin'] },
  { name: 'Store Management', href: '/store/purchase-orders', icon: ShoppingCart, roles: ['store', 'admin'] },
  { name: 'Invoices', href: '/finance/invoices', icon: Receipt, roles: ['finance', 'admin'] },
  { name: 'Payments', href: '/finance/payments', icon: CreditCard, roles: ['finance', 'admin'] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageCircle, roles: ['requester', 'manager', 'store', 'finance', 'admin'] },
];

interface SidebarProps {
  className?:string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = (session?.user as any)?.role;

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white w-64 min-h-screen p-4 overflow-y-auto transition-transform duration-300 ease-in-out z-50",
        "fixed lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Mobile close button */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
      <nav className="space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
                onClick={onClose}
              className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
                <item.icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      </div>
    </>
  );
}