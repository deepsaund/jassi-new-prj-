import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  ClipboardList,
  ListOrdered,
  Activity,
  Bell,
  User,
  LogOut,
  Menu,
  FileCheck,
  Workflow,
} from 'lucide-react';

interface Props {
  portalType: 'admin' | 'staff';
}

export default function AdminLayout({ portalType }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigate = useNavigate();
  const prefix = `/${portalType}`;

  const navItems = [
    { to: `${prefix}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    ...(portalType === 'admin'
      ? [
          { to: `${prefix}/services`, icon: Settings, label: 'Services' },
          { to: `${prefix}/users`, icon: Users, label: 'Users' },
        ]
      : []),
    { to: `${prefix}/requests`, icon: FileText, label: 'Requests' },
    { to: `${prefix}/workflow`, icon: Workflow, label: 'Workflow' },
    { to: `${prefix}/queue`, icon: ListOrdered, label: 'Work Queue' },
    { to: `${prefix}/audit`, icon: Activity, label: 'Audit Log' },
    { to: `${prefix}/notifications`, icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: `${prefix}/profile`, icon: User, label: 'Profile' },
    ...(portalType === 'admin'
      ? [{ to: `${prefix}/settings`, icon: Settings, label: 'Settings' }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <FileCheck className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold text-white">Jassi</span>
          <span className="ml-auto text-xs font-semibold bg-white/10 text-white/80 px-2 py-0.5 rounded-full uppercase">
            {portalType}
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge ? (
                <span className="ml-auto bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 w-full text-sm text-white/60 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <FileCheck className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">Jassi</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{portalType}</span>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
