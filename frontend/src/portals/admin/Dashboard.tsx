import { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';
import type { DashboardStats } from '../../types';
import { Users, FileText, Clock, TrendingUp, IndianRupee, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0D4F4F', '#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    const api = isStaff ? staffApi.getDashboard() : adminApi.getDashboard();
    api.then((res) => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: FileText, label: 'Total Requests', value: stats.total_requests, color: 'bg-blue-50 text-blue-600' },
    { icon: Clock, label: 'Pending', value: stats.pending_requests, color: 'bg-amber-50 text-amber-600' },
    { icon: TrendingUp, label: 'In Progress', value: stats.in_progress_requests, color: 'bg-purple-50 text-purple-600' },
    { icon: CheckCircle, label: 'Completed', value: stats.completed_requests, color: 'bg-emerald-50 text-emerald-600' },
    ...(!isStaff ? [
      { icon: Users, label: 'Customers', value: stats.total_customers, color: 'bg-sky-50 text-sky-600' },
      { icon: IndianRupee, label: 'Revenue', value: `₹${Number(stats.total_revenue).toLocaleString()}`, color: 'bg-green-50 text-green-600' },
    ] : []),
  ];

  const statusData = Object.entries(stats.requests_by_status || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{isStaff ? 'Staff' : 'Admin'} Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Requests (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.daily_trend}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0D4F4F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Services */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Services</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.popular_services} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Requests</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {stats.recent_requests?.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-primary">{req.tracking_id}</p>
                  <p className="text-xs text-gray-500">{req.service?.name} — {req.customer?.name}</p>
                </div>
                <span className="text-xs font-medium text-gray-500">{req.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
