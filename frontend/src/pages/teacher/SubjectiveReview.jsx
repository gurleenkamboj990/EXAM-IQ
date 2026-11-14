import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Save,
  Wand2,
  ArrowLeft,
  User,
  Clock,
  MessageSquare,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { monitorApi } from '../../api/monitorApi';
import { aiApi } from '../../api/aiApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export const SubjectiveReview = () => {
  const { id } = useParams();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gradingAiId, setGradingAiId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Local state for editable scores & comments
  const [scoreInputs, setScoreInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const data = await monitorApi.getSubjectiveReviews(id);
        setReviews(data || []);

        const initialScores = {};
        const initialComments = {};
        (data || []).forEach((r) => {
          initialScores[r.reviewId] = r.teacherScore !== null ? r.teacherScore : r.aiScore || 0;
          initialComments[r.reviewId] = r.teacherComment || '';
        });
        setScoreInputs(initialScores);
        setCommentInputs(initialComments);
      } catch (err) {
        toast.error('Failed to load subjective submissions queue');
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [id]);

  const handleGradeWithAi = async (review) => {
    setGradingAiId(review.reviewId);
    try {
      const evaluation = await aiApi.gradeShortAnswer({
        questionText: review.questionText,
        modelAnswer: review.modelAnswer,
        studentAnswer: review.studentAnswer,
        maxMarks: review.maxMarks,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === review.reviewId
            ? {
                ...r,
                aiScore: evaluation.suggestedScore,
                aiConfidence: evaluation.confidence,
                aiFeedback: evaluation.feedback,
              }
            : r
        )
      );

      setScoreInputs((prev) => ({
        ...prev,
        [review.reviewId]: evaluation.suggestedScore,
      }));

      toast.success('AI evaluated submission and populated rubric score!');
    } catch (err) {
      toast.error('AI grading evaluation failed');
    } finally {
      setGradingAiId(null);
    }
  };

  const handleSaveReview = async (reviewId) => {
    setSavingId(reviewId);
    try {
      const score = scoreInputs[reviewId];
      const comment = commentInputs[reviewId];

      await monitorApi.saveSubjectiveReview(reviewId, {
        teacherScore: score,
        teacherComment: comment,
      });

      setReviews((prev) =>
        prev.map((r) => (r.reviewId === reviewId ? { ...r, status: 'GRADED', teacherScore: score, teacherComment: comment } : r))
      );

      toast.success('Score confirmed and saved to candidate transcript!');
    } catch (err) {
      toast.error('Failed to save score review');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          to="/teacher/exams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Exam Schedule</span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-indigo-600" />
          Subjective Answer Evaluation Queue
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review written responses with AI-assisted grading suggestions, rubric comparisons, and score overrides
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All responses graded!"
          description="There are no pending short-answer submissions in this review queue."
        />
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => {
            const isGradingAi = gradingAiId === rev.reviewId;
            const isSaving = savingId === rev.reviewId;
            const isDone = rev.status === 'GRADED';

            return (
              <Card key={rev.reviewId} className="border-slate-200/80 dark:border-slate-800 shadow-soft">
                <CardHeader
                  action={
                    <div className="flex items-center gap-2">
                      <Badge variant={isDone ? 'emerald' : 'amber'} size="sm" dot>
                        {isDone ? 'Evaluation Confirmed' : 'Needs Review'}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGradeWithAi(rev)}
                        isLoading={isGradingAi}
                        leftIcon={Sparkles}
                        className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                      >
                        Grade with AI
                      </Button>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.studentAvatar}
                      alt={rev.studentName}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <CardTitle className="text-base">{rev.studentName}</CardTitle>
                      <CardDescription className="text-xs">
                        {rev.examTitle} • Submitted {rev.submittedAt}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Prompt */}
                  <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Question Statement (Max {rev.maxMarks} Marks)
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rev.questionText}
                    </p>
                  </div>

                  {/* Student Submission vs Model Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Candidate Response
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {rev.studentAnswer || '(Blank response)'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                        Model Solution & Rubric
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {rev.modelAnswer}
                      </p>
                    </div>
                  </div>

                  {/* AI Evaluation Box */}
                  {rev.aiScore !== undefined && (
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          AI Evaluator Suggestion: {rev.aiScore} / {rev.maxMarks} Marks
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          Confidence: {rev.aiConfidence}%
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                        {rev.aiFeedback}
                      </p>
                    </div>
                  )}

                  {/* Teacher Input Controls */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <Input
                        label={`Teacher Score (0 - ${rev.maxMarks})`}
                        type="number"
                        step="0.5"
                        min="0"
                        max={rev.maxMarks}
                        value={scoreInputs[rev.reviewId] ?? ''}
                        onChange={(e) =>
                          setScoreInputs({ ...scoreInputs, [rev.reviewId]: e.target.value })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end gap-2">
                      <div className="flex-1">
                        <Input
                          label="Educator Feedback / Remarks"
                          placeholder="Add tailored feedback for the student..."
                          value={commentInputs[rev.reviewId] ?? ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [rev.reviewId]: e.target.value })
                          }
                        />
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleSaveReview(rev.reviewId)}
                        isLoading={isSaving}
                        leftIcon={Save}
                      >
                        Confirm Score
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectiveReview;

