import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  Calendar,
  FileQuestion,
  Award,
  PlayCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { examApi } from '../../api/examApi';
import { resultApi } from '../../api/resultApi';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/formatters';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const AvailableExams = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [examsList, resultsList] = await Promise.all([
        examApi.getAll({ search, subject }),
        resultApi.getAll({ studentId: user?.id || 'usr_stud_01' }),
      ]);
      setExams(examsList || []);
      setResults(resultsList || []);
    } catch (err) {
      toast.error('Failed to load examinations');
    } finally {
      setIsLoading(false);
    }
  }, [search, subject, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map results by examId
  const resultMap = results.reduce((acc, r) => {
    acc[r.examId] = r;
    return acc;
  }, {});

  const getStatusBadgeVariant = (status) => {
    switch (status) {
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

  const getRelativeStartTimeText = (startTime) => {
    const diff = new Date(startTime).getTime() - Date.now();
    if (diff <= 0) return 'Window open';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Starts in ${days}d ${hours % 24}h`;
    if (hours > 0) return `Starts in ${hours} hours`;
    const mins = Math.floor(diff / (1000 * 60));
    return `Starts in ${mins} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Available Examinations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse active and upcoming assessment sessions for your registered curriculum
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search by exam title or subject..."
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Exam Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No exams available"
          description="There are currently no examinations matching your enrolled courses or filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const pastResult = resultMap[exam.id];
            const isAttempted = Boolean(pastResult);
            const isLive = exam.status === 'LIVE';
            const isUpcoming = exam.status === 'UPCOMING';

            return (
              <Card key={exam.id} hoverable className="flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  {/* Top tags */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                      {exam.subject}
                    </span>

                    {isAttempted ? (
                      <Badge variant="emerald" size="sm" dot>
                        Attempted ({pastResult.score} pts)
                      </Badge>
                    ) : (
                      <Badge variant={getStatusBadgeVariant(exam.status)} size="sm" dot>
                        {isLive ? 'Live Window' : isUpcoming ? 'Upcoming' : 'Closed'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Metadata grid */}
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
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalMarks} Marks</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{formatDate(exam.startTime)}</span>
                    </div>
                  </div>

                  {/* Negative marking indicator */}
                  {exam.negativeMarking && (
                    <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Negative marking: -{exam.negativeMarkValue} per wrong MCQ</span>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {isUpcoming && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {getRelativeStartTimeText(exam.startTime)}
                      </span>
                    )}
                    {isLive && !isAttempted && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Window open now
                      </span>
                    )}
                    {exam.status === 'COMPLETED' && !isAttempted && (
                      <span className="text-slate-400">Assessment ended</span>
                    )}
                  </div>

                  {isAttempted ? (
                    <Link to={`/student/results/${pastResult.attemptId}`}>
                      <Button variant="outline" size="sm" rightIcon={ArrowRight}>
                        View Result
                      </Button>
                    </Link>
                  ) : isLive ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={PlayCircle}
                      onClick={() => navigate(`/student/exams/${exam.id}/attempt`)}
                    >
                      Start Exam
                    </Button>
                  ) : isUpcoming ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      leftIcon={Lock}
                      title="This exam has not started yet"
                    >
                      Locked
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      Closed
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;

