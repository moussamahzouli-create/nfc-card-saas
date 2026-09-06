'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  CreditCard, 
  Layers, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  X,
  AlertCircle,
  Key
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  _count: {
    profiles: number;
    assignments: number;
    orders: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserData | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleOpenResetPassword = (user: UserData) => {
    setResetTargetUser(user);
    setResetPassword('');
    setResetError('');
    setResetSuccess('');
    setShowResetModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetError('');
    setResetSuccess('');
    setResetting(true);

    try {
      const res = await fetch(`/api/admin/users/${resetTargetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Failed to update password');
      } else {
        setResetSuccess(`Password for ${resetTargetUser.name} updated successfully!`);
        setTimeout(() => {
          setShowResetModal(false);
        }, 1200);
      }
    } catch (e: any) {
      setResetError('Something went wrong. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${roleFilter === 'ALL' ? '' : roleFilter}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone || undefined,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create user');
      } else {
        setSuccessMsg(`User ${newName} created successfully!`);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('');
        fetchUsers();
      }
    } catch (err: any) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: nextStatus as any } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <span>Users & Vendors Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage customer accounts, assign vendor/seller permissions, and monitor active profiles.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New User / Vendor</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white mt-3">{totalUsers}</div>
          <p className="text-xs text-slate-500 mt-1">All registered platform members</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendors & Admins</span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400 mt-3">{adminCount}</div>
          <p className="text-xs text-slate-500 mt-1">Sellers, agents and administrators</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">{customerCount}</div>
          <p className="text-xs text-slate-500 mt-1">Regular card owners</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-900/40 p-4 rounded-3xl border border-slate-800 backdrop-blur-md">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role === 'ADMIN' ? 'Vendors (Admin)' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm text-slate-400">Loading accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold">No accounts found matching your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/40 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                          {user.name[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{user.name}</span>
                          <span className="text-xs text-slate-400 block">{user.email}</span>
                          {user.phone && <span className="text-[11px] text-slate-500 block">{user.phone}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer outline-none transition-colors ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-950/40 text-purple-400 border-purple-800/60'
                            : user.role === 'ADMIN'
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/60'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="CUSTOMER" className="bg-slate-900 text-white">Customer</option>
                        <option value="ADMIN" className="bg-slate-900 text-white">Vendor (Admin)</option>
                        <option value="SUPER_ADMIN" className="bg-slate-900 text-white">Super Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-400" title="Profiles">
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <strong className="text-white">{user._count?.profiles || 0}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400" title="NFC Cards Assigned">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-white">{user._count?.assignments || 0}</strong>
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/60'
                            : 'bg-rose-950/30 text-rose-400 border-rose-800/40 hover:bg-rose-950/60'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenResetPassword(user)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-xl transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-500" />
                <span>Add New Account</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create an account for a customer, agent, or vendor with pre-assigned permissions.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Vendor Store"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="vendor@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Role / Account Type *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ADMIN">Vendor / Seller (Admin Access)</option>
                  <option value="CUSTOMER">Customer (Standard User)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full System Access)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Vendors get access to the Admin Portal to provision and issue NFC cards.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-amber-500" />
                <span>Reset Password</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Set a new password for <strong className="text-white">{resetTargetUser.name}</strong> ({resetTargetUser.email}).
              </p>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={resetting}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
