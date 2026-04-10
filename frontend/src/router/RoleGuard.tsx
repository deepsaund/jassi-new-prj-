import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own portal
    const portalMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      staff: '/staff/dashboard',
      customer: '/customer/dashboard',
      b2b: '/b2b/dashboard',
    };
    return <Navigate to={portalMap[user.role]} replace />;
  }

  return <Outlet />;
}
