import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Users,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { analyticsApi } from '../../api/analyticsApi';
import { examApi } from '../../api/examApi';
import { useAuthStore } from '../../store/authStore';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
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

export const Leaderboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 'exam'
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('exam_live_01');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load exams list for dropdown
  useEffect(() => {
    examApi.getAll().then((data) => {
      setExams(data || []);
      if (data.length > 0) setSelectedExamId(data[0].id);
    });
  }, []);

  // Load leaderboard data
  useEffect(() => {
    async function fetchBoard() {
      setIsLoading(true);
      try {
        const data = await analyticsApi.getLeaderboard({
          examId: selectedExamId,
          type: activeTab,
        });
        setLeaderboard(data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBoard();
  }, [activeTab, selectedExamId]);

  const tabs = [
    { id: 'overall', label: 'Overall Cohort Standings', icon: Trophy },
    { id: 'exam', label: 'Assessment Rankings', icon: Medal },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-sm shadow-amber-400/40">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-black text-xs shadow-sm">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-xs shadow-sm">
          🥉
        </span>
      );
    }
    return <span className="font-bold text-xs text-slate-400 w-7 text-center">#{rank}</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
            Academic Hall of Fame
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Academic Leaderboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Top performers across enrolled modules, assessments, and continuous evaluation
        </p>
      </div>

      {/* Tabs and Exam Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'exam' && (
          <div className="w-full sm:w-64">
            <Select
              options={exams.map((e) => ({ value: e.id, label: e.title }))}
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Top 3 Podium (Visual) */}
      {!isLoading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-soft order-1">
            <span className="text-2xl mb-1">🥈</span>
            <img
              src={leaderboard[1].avatar}
              alt={leaderboard[1].name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600 mb-2"
            />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
              {leaderboard[1].name}
            </p>
            <span className="text-[11px] font-black text-brand-600 mt-1">
              {leaderboard[1].averageScore || leaderboard[1].percentage}%
            </span>
            <span className="text-[10px] text-slate-400">Rank #2</span>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center p-6 rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700 text-center shadow-soft-lg order-2 -translate-y-2">
            <span className="text-3xl mb-1">👑</span>
            <img
              src={leaderboard[0].avatar}
              alt={leaderboard[0].name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-400 mb-2"
            />
            <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
              {leaderboard[0].name}
            </p>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1">
              {leaderboard[0].averageScore || leaderboard[0].percentage}%
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full mt-1">
              Gold Medalist
            </span>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-soft order-3">
            <span className="text-2xl mb-1">🥉</span>
            <img
              src={leaderboard[2].avatar}
              alt={leaderboard[2].name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-700 mb-2"
            />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
              {leaderboard[2].name}
            </p>
            <span className="text-[11px] font-black text-indigo-600 mt-1">
              {leaderboard[2].averageScore || leaderboard[2].percentage}%
            </span>
            <span className="text-[10px] text-slate-400">Rank #3</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardContent noPadding>
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>{activeTab === 'overall' ? 'Exams Completed' : 'Score Earned'}</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead className="text-right">Standing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((item) => {
                  const isCurrent = item.isCurrentUser || item.studentId === user?.id || item.studentId === 'usr_stud_01';

                  return (
                    <TableRow
                      key={item.studentId}
                      className={isCurrent ? 'bg-brand-50/70 dark:bg-brand-950/40 border-l-4 border-l-brand-600' : ''}
                    >
                      <TableCell>{getRankBadge(item.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {item.name}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 text-[10px] uppercase font-bold text-brand-600 bg-brand-100 dark:bg-brand-950 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {activeTab === 'overall' ? `${item.examsTaken} Papers` : `${item.score} / ${item.totalMarks} pts`}
                      </TableCell>
                      <TableCell className="font-black text-xs text-slate-900 dark:text-slate-100">
                        {item.averageScore || item.percentage}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            item.rank === 1
                              ? 'amber'
                              : item.rank <= 3
                              ? 'indigo'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          Top {Math.max(1, Math.round((item.rank / 25) * 100))}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;

