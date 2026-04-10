import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { User } from '../../types';
import { Search, Plus, Edit, UserX, Shield, Users as UsersIcon } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ search, role: roleFilter || undefined, page, per_page: 10 }).then((res) => {
      setUsers(res.data.data);
      setLastPage(res.data.last_page);
      setLoading(false);
    });
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', phone: '', password: '', role: 'customer', address: '' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '', role: user.role, address: user.address || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        const data: any = { ...form };
        if (!data.password) delete data.password;
        await adminApi.updateUser(editUser.id, data);
      } else {
        await adminApi.createUser(form);
      }
      setShowModal(false);
      fetchUsers();
    } catch {}
    setSaving(false);
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this user?')) return;
    await adminApi.deleteUser(id);
    fetchUsers();
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    staff: 'bg-blue-100 text-blue-700',
    customer: 'bg-emerald-100 text-emerald-700',
    b2b: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add User
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
            <option value="b2b">B2B</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${roleColors[user.role] || 'badge-neutral'}`}>{user.role.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={user.is_active ? 'badge-success' : 'badge-danger'}>{user.is_active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeactivate(user.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><UserX className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editUser ? 'Edit User' : 'Create User'}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
              {!editUser && <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />}
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="customer">Customer</option>
                <option value="b2b">B2B</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field min-h-[60px]" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
