import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminExams, deleteAdminExam } from '../../api/adminApi';
import { formatDate, formatDateTime } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';

const statusConfig = {
  LIVE: { variant: 'emerald', label: 'Live' },
  UPCOMING: { variant: 'amber', label: 'Upcoming' },
  COMPLETED: { variant: 'neutral', label: 'Completed' },
};

export const AllExams = () => {
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const [detailExam, setDetailExam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminExams({ search, status: filterStatus, page });
      setExams(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterStatus, page]);

  useEffect(() => {
    document.title = 'All Exams | ExamIQ Admin';
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAdminExam(deleteTarget.id);
      toast.success('Exam removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete exam');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">All Exams</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of every examination across all teachers — {total} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title or teacher…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(k => <Skeleton key={k} className="h-14 rounded-xl" />)}
          </div>
        ) : exams.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title="No exams found" description="Adjust your filters." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const st = statusConfig[exam.computedStatus] || statusConfig.COMPLETED;
                return (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {exam.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {exam.teacherName || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="brand" size="sm">{exam.subject || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.variant} size="sm" dot>{st.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {exam.durationMinutes}m
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(exam.startTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailExam(exam)}
                          title="View details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                          aria-label="View exam details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exam)}
                          title="Delete exam"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          aria-label="Delete exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailExam}
        onClose={() => setDetailExam(null)}
        title="Exam Details"
        size="lg"
      >
        {detailExam && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{detailExam.title}</h3>
              {detailExam.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{detailExam.description}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Teacher', value: detailExam.teacherName || 'Unknown' },
                { icon: FileSpreadsheet, label: 'Subject', value: detailExam.subject || '—' },
                { icon: Calendar, label: 'Start', value: formatDateTime(detailExam.startTime) },
                { icon: Calendar, label: 'End', value: formatDateTime(detailExam.endTime) },
                { icon: Clock, label: 'Duration', value: `${detailExam.durationMinutes} minutes` },
                { label: 'Status', value: statusConfig[detailExam.computedStatus]?.label || detailExam.computedStatus },
                { label: 'Questions', value: detailExam.questionCount || (detailExam.questions?.length ?? '—') },
                { label: 'Passing Score', value: `${detailExam.passingScore ?? 60}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailExam(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Exam"
        message={`Remove "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AllExams;

