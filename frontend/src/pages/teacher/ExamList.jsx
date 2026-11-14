import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  FileSpreadsheet,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Users,
  Radio,
  BarChart3,
  PenLine,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { examApi } from '../../api/examApi';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [subject, setSubject] = useState('ALL');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await examApi.getAll({ search, status, subject });
      setExams(data || []);
    } catch {
      toast.error('Failed to load exam schedule');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, subject]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDuplicate = async (id) => {
    try {
      await examApi.duplicate(id);
      toast.success('Exam duplicated as draft copy');
      fetchExams();
    } catch {
      toast.error('Failed to duplicate exam');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await examApi.delete(deleteId);
      toast.success('Exam schedule deleted successfully');
      setDeleteId(null);
      fetchExams();
    } catch {
      toast.error('Failed to delete exam');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (st) => {
    switch (st) {
      case 'LIVE':
        return 'emerald';
      case 'UPCOMING':
        return 'amber';
      case 'COMPLETED':
        return 'neutral';
      default:
        return 'brand';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Exam Management & Schedules
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor active papers, upcoming testing slots, and past assessments
          </p>
        </div>

        <Link to="/teacher/exams/new">
          <Button variant="primary" size="md" leftIcon={Plus}>
            Create New Exam
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by title or subject..."
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'LIVE', label: 'Live Now' },
            { value: 'UPCOMING', label: 'Upcoming' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        <Select
          options={[
            { value: 'ALL', label: 'All Subjects' },
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'DBMS', label: 'DBMS' },
            { value: 'Java', label: 'Java' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Physics', label: 'Physics' },
            { value: 'Networks', label: 'Networks' },
          ]}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Exam Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No examinations found"
          description="Create your first exam wizard schedule or adjust your active filters."
          actionLabel="Create Exam"
          onAction={() => navigate('/teacher/exams/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} hoverable className="flex flex-col justify-between">
              <div className="p-6 space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                    {exam.subject}
                  </span>
                  <Badge variant={getStatusBadgeVariant(exam.status)} size="sm" dot>
                    {exam.status === 'LIVE'
                      ? 'Live Now'
                      : exam.status === 'UPCOMING'
                      ? 'Upcoming'
                      : 'Completed'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                {/* Key metadata pills */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.duration} mins</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.questionCount} Questions</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{formatDate(exam.startTime)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span>{exam.totalMarks} Total Marks</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl flex flex-col gap-2">
                {/* Primary actions row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit examination"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(exam.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Duplicate exam"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(exam.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                  >
                    Configure
                  </Button>
                </div>

                {/* Phase 3 quick-action row */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  {exam.status === 'LIVE' && (
                    <button
                      type="button"
                      onClick={() => navigate(`/teacher/monitor/${exam.id}`)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                      title="Live Monitor"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Monitor
                    </button>
                  )}
                  {exam.status === 'COMPLETED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/exams/${exam.id}/analytics`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-950 transition-colors"
                        title="Exam Analytics"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Analytics
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/exams/${exam.id}/review`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
                        title="Subjective Review"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Examination?"
        message="This will remove the scheduled exam paper and cannot be undone."
        confirmText="Delete Exam"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExamList;
