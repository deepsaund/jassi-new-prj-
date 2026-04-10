import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';

// Auth pages
import Login from '../portals/auth/Login';
import Register from '../portals/auth/Register';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Customer pages
import CustomerDashboard from '../portals/customer/Dashboard';
import ServiceCatalog from '../portals/customer/ServiceCatalog';
import NewRequest from '../portals/customer/NewRequest';
import RequestDetail from '../portals/customer/RequestDetail';
import DocumentVaultPage from '../portals/customer/DocumentVault';
import CustomerNotifications from '../portals/customer/Notifications';
import CustomerProfile from '../portals/customer/Profile';

// Admin pages
import AdminDashboard from '../portals/admin/Dashboard';
import AdminServices from '../portals/admin/Services';
import ServiceForm from '../portals/admin/ServiceForm';
import AdminUsers from '../portals/admin/Users';
import RequestReview from '../portals/admin/RequestReview';
import Workflow from '../portals/admin/Workflow';
import Queue from '../portals/admin/Queue';
import AuditLogPage from '../portals/admin/AuditLog';
import CustomerDetailPage from '../portals/admin/CustomerDetail';
import AdminSettings from '../portals/admin/Settings';
import AdminRequestDetail from '../portals/admin/AdminRequestDetail';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Customer portal
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRoles={['customer']} />,
        children: [
          {
            element: <CustomerLayout portalType="customer" />,
            children: [
              { path: '/customer/dashboard', element: <CustomerDashboard /> },
              { path: '/customer/services', element: <ServiceCatalog portalType="customer" /> },
              { path: '/customer/requests/new/:serviceId', element: <NewRequest portalType="customer" /> },
              { path: '/customer/requests/:id', element: <RequestDetail /> },
              { path: '/customer/vault', element: <DocumentVaultPage /> },
              { path: '/customer/notifications', element: <CustomerNotifications /> },
              { path: '/customer/profile', element: <CustomerProfile /> },
            ],
          },
        ],
      },

      // B2B portal (reuses customer components)
      {
        element: <RoleGuard allowedRoles={['b2b']} />,
        children: [
          {
            element: <CustomerLayout portalType="b2b" />,
            children: [
              { path: '/b2b/dashboard', element: <CustomerDashboard /> },
              { path: '/b2b/services', element: <ServiceCatalog portalType="b2b" /> },
              { path: '/b2b/requests/new/:serviceId', element: <NewRequest portalType="b2b" /> },
              { path: '/b2b/requests/:id', element: <RequestDetail /> },
              { path: '/b2b/vault', element: <DocumentVaultPage /> },
              { path: '/b2b/notifications', element: <CustomerNotifications /> },
              { path: '/b2b/profile', element: <CustomerProfile /> },
            ],
          },
        ],
      },

      // Admin portal
      {
        element: <RoleGuard allowedRoles={['admin']} />,
        children: [
          {
            element: <AdminLayout portalType="admin" />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              { path: '/admin/services', element: <AdminServices /> },
              { path: '/admin/services/new', element: <ServiceForm /> },
              { path: '/admin/services/:id/edit', element: <ServiceForm /> },
              { path: '/admin/users', element: <AdminUsers /> },
              { path: '/admin/requests', element: <RequestReview portalType="admin" /> },
              { path: '/admin/requests/:id', element: <AdminRequestDetail portalType="admin" /> },
              { path: '/admin/workflow', element: <Workflow /> },
              { path: '/admin/queue', element: <Queue portalType="admin" /> },
              { path: '/admin/audit', element: <AuditLogPage portalType="admin" /> },
              { path: '/admin/customers/:id', element: <CustomerDetailPage /> },
              { path: '/admin/settings', element: <AdminSettings /> },
              { path: '/admin/notifications', element: <CustomerNotifications /> },
              { path: '/admin/profile', element: <CustomerProfile /> },
            ],
          },
        ],
      },

      // Staff portal (reuses admin components with restricted scope)
      {
        element: <RoleGuard allowedRoles={['staff']} />,
        children: [
          {
            element: <AdminLayout portalType="staff" />,
            children: [
              { path: '/staff/dashboard', element: <AdminDashboard /> },
              { path: '/staff/requests', element: <RequestReview portalType="staff" /> },
              { path: '/staff/requests/:id', element: <AdminRequestDetail portalType="staff" /> },
              { path: '/staff/workflow', element: <Workflow /> },
              { path: '/staff/queue', element: <Queue portalType="staff" /> },
              { path: '/staff/audit', element: <AuditLogPage portalType="staff" /> },
              { path: '/staff/customers/:id', element: <CustomerDetailPage /> },
              { path: '/staff/notifications', element: <CustomerNotifications /> },
              { path: '/staff/profile', element: <CustomerProfile /> },
            ],
          },
        ],
      },
    ],
  },

  // Default redirects
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
