import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { resultApi } from '../../api/resultApi';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/formatters';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const MyResults = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const data = await resultApi.getAll({
          studentId: user?.id || 'usr_stud_01',
          search,
        });
        setResults(data || []);
      } catch (err) {
        toast.error('Failed to load past exam results');
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [search, user?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          My Exam Results & Transcripts
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Historical overview of all completed examinations, score breakdowns, and performance analytics
        </p>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft max-w-md">
        <Input
          placeholder="Filter by title or subject..."
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results Table Card */}
      <Card>
        <CardContent noPadding>
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Award}
                title="No examination records found"
                description="You haven't completed any assessments yet, or no results match your query."
                actionLabel="Explore Available Exams"
                onAction={() => navigate('/student/exams')}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment Title</TableHead>
                  <TableHead>Score Earned</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((res) => (
                  <TableRow key={res.attemptId}>
                    <TableCell>
                      <div>
                        {res.subject && (
                          <span className="text-[10px] font-mono font-bold uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-1.5 py-0.5 rounded mr-2">
                            {res.subject}
                          </span>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {res.examTitle}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {res.score} / {res.totalMarks} pts
                    </TableCell>
                    <TableCell>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {res.percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={res.passed ? 'emerald' : 'danger'} size="sm" dot>
                        {res.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDate(res.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/student/results/${res.attemptId}`}>
                        <Button variant="outline" size="sm" rightIcon={ArrowRight}>
                          View Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyResults;

