import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

import { aiApi } from '../../api/aiApi';
import { useThemeStore } from '../../store/themeStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export const AIFeedback = ({ result, attemptId }) => {
  const { isDark } = useThemeStore();
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchFeedback = async (isReload = false) => {
    if (isReload) setIsRegenerating(true);
    else setIsLoading(true);

    try {
      const data = await aiApi.getPersonalizedFeedback({ attemptId, result });
      setFeedback(data);
      if (isReload) {
        toast.success('Regenerated personalized AI feedback!');
      }
    } catch (err) {
      toast.error('Unable to generate AI study feedback');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    if (result && attemptId) {
      fetchFeedback(false);
    }
  }, [attemptId, result]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Generating cognitive diagnostic & personalized study plan...</span>
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (!feedback) return null;

  return (
    <Card className="border-brand-200/60 dark:border-brand-900/40 shadow-soft overflow-hidden">
      <CardHeader
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFeedback(true)}
            isLoading={isRegenerating}
            leftIcon={RefreshCw}
          >
            Regenerate
          </Button>
        }
      >
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <CardTitle>AI Cognitive Diagnostic & Study Plan</CardTitle>
            <CardDescription>Personalized diagnostic generated from your question response telemetry</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Topic Breakdown Bar Chart */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Topic Mastery Index (% Accuracy)
          </h4>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedback.topicBreakdown} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="topic" type="category" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} width={130} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}% Mastery`, 'Accuracy']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.875rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 8, 8, 0]}>
                  {feedback.topicBreakdown.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy >= 50 ? '#f59e0b' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Demonstrated Strengths
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {feedback.strongTopics.map((st, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Identified Revision Targets
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {feedback.weakTopics.map((wt, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                >
                  {wt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-brand-600" />
            Recommended Next Steps
          </h4>

          <div className="space-y-2">
            {feedback.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs flex items-start gap-2.5"
              >
                <span className="font-bold text-brand-600 dark:text-brand-400 mt-0.5">#{idx + 1}</span>
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFeedback;

