import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Radio,
  Search,
  ExternalLink,
  X,
  Eye,
  RefreshCw,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { monitorApi } from '../../api/monitorApi';
import { examApi } from '../../api/examApi';
import { useWebSocket } from '../../hooks/useWebSocket';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const LiveMonitor = () => {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(routeExamId || 'exam_live_01');
  const [candidates, setCandidates] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer state for selected candidate violations
  const [activeCandidate, setActiveCandidate] = useState(null);

  // Search query
  const [search, setSearch] = useState('');

  // Load active exams for dropdown
  useEffect(() => {
    examApi.getAll().then((data) => {
      setExams(data || []);
      if (!routeExamId && data.length > 0) {
        const liveExam = data.find((e) => e.status === 'LIVE') || data[0];
        setSelectedExamId(liveExam.id);
      }
    });
  }, [routeExamId]);

  // Load candidate list
  const fetchCandidates = useCallback(async () => {
    if (!selectedExamId) return;
    setIsLoading(true);
    try {
      const data = await monitorApi.getLiveCandidates(selectedExamId);
      setCandidates(data || []);
    } catch (err) {
      toast.error('Failed to connect to live monitoring cluster');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExamId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // WebSocket Live Updates
  const handleLiveEvent = useCallback((event) => {
    setAlerts((prev) => [event, ...prev.slice(0, 19)]); // keep latest 20 events

    // Dynamically update candidate stats in real-time
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.name === event.studentName) {
          const newViolations = event.type !== 'PROGRESS'
            ? [
                {
                  id: event.id,
                  timestamp: event.timestamp,
                  type: event.type,
                  message: event.message,
                  weight: event.severity === 'HIGH' ? 20 : 10,
                },
                ...c.violations,
              ]
            : c.violations;

          const updatedRisk = Math.min(100, c.riskScore + (event.severity === 'HIGH' ? 15 : event.severity === 'MEDIUM' ? 8 : 0));
          return {
            ...c,
            riskScore: updatedRisk,
            riskLevel: updatedRisk >= 70 ? 'HIGH' : updatedRisk >= 30 ? 'MEDIUM' : 'LOW',
            violationCount: newViolations.length,
            violations: newViolations,
            lastPing: 'Just now',
          };
        }
        return c;
      })
    );
  }, []);

  const { isConnected } = useWebSocket({
    examId: selectedExamId,
    onEvent: handleLiveEvent,
    isEnabled: Boolean(selectedExamId),
  });

  const getRiskBadgeVariant = (level) => {
    switch (level) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'emerald';
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Proctoring Sentinel
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Socket: {isConnected ? 'Streaming' : 'Connecting'}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
            Live Examination Monitor
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time candidate telemetry, telemetry anomalies, and behavioral cheating-risk scoring
          </p>
        </div>

        {/* Exam Picker Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-72">
          <Select
            options={exams.map((e) => ({
              value: e.id,
              label: `${e.status === 'LIVE' ? '🟢 ' : ''}${e.title}`,
            }))}
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              navigate(`/teacher/monitor/${e.target.value}`);
            }}
          />
        </div>
      </div>

      {/* Main Grid: Active Candidates on left, Live Alerts Stream on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between gap-3">
            <Input
              placeholder="Search active candidates by name or email..."
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
              <span>{filteredCandidates.length} Active Sessions</span>
              <Button variant="ghost" size="sm" onClick={fetchCandidates} leftIcon={RefreshCw}>
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No active sessions detected"
              description="No candidates are currently taking this assessment session."
            />
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => setActiveCandidate(cand)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md ${
                    cand.riskLevel === 'HIGH'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                      : cand.riskLevel === 'MEDIUM'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3.5">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cand.name}
                          </h4>
                          <Badge variant={getRiskBadgeVariant(cand.riskLevel)} size="sm" dot>
                            {cand.riskLevel} Risk ({cand.riskScore}%)
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{cand.email}</p>
                      </div>
                    </div>

                    {/* Progress & Time */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Progress</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {cand.answeredCount} / {cand.totalQuestions} Qs
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Left</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {Math.floor(cand.timeRemainingSeconds / 60)}m {cand.timeRemainingSeconds % 60}s
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Violations</span>
                        <span
                          className={`font-black ${
                            cand.violationCount > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cand.violationCount} Logged
                        </span>
                      </div>

                      <Button variant="outline" size="sm" rightIcon={ExternalLink}>
                        Inspect Log
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Alerts Stream Sidebar */}
        <div>
          <Card className="h-full">
            <CardHeader
              action={
                <span className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Live Event Stream
                </span>
              }
            >
              <CardTitle>Security Feed</CardTitle>
              <CardDescription>Real-time socket emissions from active candidate webcams and browsers</CardDescription>
            </CardHeader>

            <CardContent noPadding>
              <div className="max-h-[550px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">
                    Monitoring telemetry... Anomaly events will broadcast here in real-time.
                  </p>
                ) : (
                  alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-3 rounded-xl transition-all text-xs space-y-1 ${
                        al.severity === 'HIGH'
                          ? 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60'
                          : al.severity === 'MEDIUM'
                          ? 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{al.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{al.timestamp}</span>
                      </div>
                      <p className="leading-snug">{al.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidate Violation Inspector Drawer */}
      <Modal
        isOpen={Boolean(activeCandidate)}
        onClose={() => setActiveCandidate(null)}
        title={activeCandidate ? `${activeCandidate.name} - Proctoring Audit Trail` : 'Candidate Log'}
        maxWidth="max-w-xl"
      >
        {activeCandidate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={activeCandidate.avatar}
                alt={activeCandidate.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-300 dark:ring-slate-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {activeCandidate.name}
                  </h4>
                  <Badge variant={getRiskBadgeVariant(activeCandidate.riskLevel)} size="sm">
                    {activeCandidate.riskLevel} Risk ({activeCandidate.riskScore}%)
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono">{activeCandidate.email}</p>
              </div>
            </div>

            {/* Violation list */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detailed Violation Logs ({activeCandidate.violations.length})
              </h5>

              {activeCandidate.violations.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 py-4 text-center font-semibold">
                  Zero security infractions logged. Candidate session clean.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {activeCandidate.violations.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {v.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{v.timestamp}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-normal">{v.message}</p>
                      <span className="text-[10px] font-bold text-rose-500">
                        Penalty Weight: +{v.weight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setActiveCandidate(null)}>
                Close Audit Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LiveMonitor;

