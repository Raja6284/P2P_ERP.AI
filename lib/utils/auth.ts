import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('auth/login');
  }

  if (allowedRoles && !allowedRoles.includes((session.user as any).role)) {
    redirect('/unauthorized');
  }

  return session;
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}