import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getUsers, createUser, updateUserRole, setUserStatus, deleteUser } from '../../api/adminApi';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/formatters';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];

const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
});

const roleBadge = (role) => {
  if (role === 'ADMIN') return 'danger';
  if (role === 'TEACHER') return 'indigo';
  return 'emerald';
};

export const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: { name: '', email: '', role: 'STUDENT' },
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUsers({ search, role: filterRole, status: filterStatus, page });
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterRole, filterStatus, page]);

  useEffect(() => {
    document.title = 'User Management | ExamIQ Admin';
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleRoleChange(userId, role) {
    try {
      await updateUserRole(userId, role);
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  }

  async function handleStatusToggle() {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await setUserStatus(statusTarget.id, newStatus);
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      setStatusTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  }

  async function handleAddUser(data) {
    setAddLoading(true);
    try {
      await createUser(data);
      toast.success('User created successfully');
      reset();
      setAddModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  }

  const isSelf = (u) => u.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage accounts, roles, and access — {total} users total
          </p>
        </div>
        <Button variant="primary" leftIcon={UserPlus} onClick={() => setAddModalOpen(true)}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(k => <Skeleton key={k} className="h-14 rounded-xl" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Adjust your filters." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                        {u.name.slice(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {u.name}
                          {isSelf(u) && (
                            <span className="ml-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      disabled={isSelf(u)}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Role for ${u.name}`}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === 'ACTIVE' ? 'emerald' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {u.lastLogin ? formatDate(u.lastLogin) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(u.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        disabled={isSelf(u)}
                        onClick={() => setStatusTarget(u)}
                        title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={u.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
                      >
                        {u.status === 'ACTIVE' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        disabled={isSelf(u)}
                        onClick={() => setDeleteTarget(u)}
                        title="Delete user"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={ChevronLeft} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); reset(); }}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleSubmit(handleAddUser)} className="space-y-4">
          <Input
            label="Full Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Jane Smith"
          />
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="jane@example.com"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
            <select
              {...register('role')}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <p className="text-xs text-rose-500">{errors.role.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setAddModalOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={addLoading} leftIcon={UserPlus}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Status Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusToggle}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${statusTarget?.name}?`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default UserManagement;

