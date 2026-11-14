import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  FileCheck,
  Check,
  Camera,
  Maximize2,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { examApi } from '../../api/examApi';
import { attemptApi } from '../../api/attemptApi';
import { useAuthStore } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';
import { useThemeStore } from '../../store/themeStore';
import { useTimer } from '../../hooks/useTimer';
import { useProctoring } from '../../hooks/useProctoring';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import WebcamThumbnail from '../../components/proctoring/WebcamThumbnail';
import ProctoringWarningModal from '../../components/proctoring/ProctoringWarningModal';

export const ExamAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Adaptive mode state
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('MEDIUM');

  const attemptIdRef = useRef(`att_${id}_${user?.id || 'usr'}`);
  const preExamVideoRef = useRef(null);

  // Zustand Store
  const {
    exam,
    questions,
    currentQuestionIndex,
    answers,
    reviewMarked,
    isStarted,
    isSubmitting,
    isSaved,
    initAttempt,
    startExam,
    setAnswer,
    clearAnswer,
    toggleReview,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setIsSubmitting,
    resetAttempt,
  } = useExamStore();

  const isProctoringActive = Boolean(exam?.proctoring);
  const isAdaptive = Boolean(exam?.adaptiveMode);

  // Load Exam and Questions
  useEffect(() => {
    async function loadExam() {
      setIsLoading(true);
      try {
        const examData = await examApi.getById(id, true);
        if (!examData) {
          toast.error('Exam not found');
          navigate('/student/exams');
          return;
        }

        initAttempt(examData, examData.questions || [], attemptIdRef.current);
      } catch (err) {
        toast.error('Failed to load assessment questions');
        navigate('/student/exams');
      } finally {
        setIsLoading(false);
      }
    }
    loadExam();
  }, [id, initAttempt, navigate]);

  // Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (!exam || isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setIsSubmitted(true);

    try {
      const result = await attemptApi.submitAttempt({
        attemptId: attemptIdRef.current,
        examId: exam.id,
        studentId: user?.id || 'usr_stud_01',
        studentName: user?.name || 'Alex Morgan',
        answers,
        timeSpentSeconds: 0,
        riskScore: proctoring.riskScore,
        riskLevel: proctoring.riskLevel,
        violations: proctoring.violations,
      });

      // Cleanup camera & timer
      timer.clearTimer();
      proctoring.stopCamera();
      resetAttempt();

      toast.success('Examination submitted successfully!');
      navigate(`/student/results/${result.attemptId}`, { replace: true });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
      setIsSubmitting(false);
      setIsSubmitted(false);
    }
  }, [exam, isSubmitting, isSubmitted, user, answers, navigate, resetAttempt, setIsSubmitting]);

  // Proctoring Hook
  const proctoring = useProctoring({
    isEnabled: isStarted && isProctoringActive,
    maxViolations: 5,
    onMaxViolationsExceeded: () => {
      toast.error('Maximum proctoring violations exceeded. Paper auto-submitted for review.', {
        duration: 6000,
      });
      handleFinalSubmit();
    },
    onViolationOccurred: (v) => {
      toast.error(`Security Warning: ${v.type}`, { icon: '⚠️' });
    },
  });

  // Timer Hook
  const timer = useTimer({
    durationMinutes: exam?.duration || 30,
    timerId: `${id}_${attemptIdRef.current}`,
    onExpire: () => {
      toast.error('Time has expired! Submitting your responses automatically...', {
        duration: 5000,
      });
      handleFinalSubmit();
    },
    isEnabled: isStarted,
  });

  // Camera test in pre-exam screen
  const handleTestCamera = async () => {
    const stream = await proctoring.requestCamera();
    if (stream) {
      setCameraVerified(true);
      if (preExamVideoRef.current) {
        preExamVideoRef.current.srcObject = stream;
      }
      toast.success('Webcam initialized! Face framing confirmed.');
    }
  };

  // Begin Exam
  const handleBeginAssessment = async () => {
    if (isProctoringActive && !cameraVerified) {
      toast.error('Please verify your webcam before starting.');
      return;
    }

    if (isProctoringActive) {
      await proctoring.requestFullscreen();
    }

    startExam();
  };

  // Warn on page unload / navigation while exam is active
  useEffect(() => {
    if (!isStarted || isSubmitted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active exam attempt. Changes might not be saved.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStarted, isSubmitted]);

  // Statistics
  const currentQ = questions[currentQuestionIndex];
  const totalQuestionsCount = questions.length;

  const answeredCount = questions.filter((q) => {
    const val = answers[q.id];
    return val !== undefined && val !== null && val !== '';
  }).length;

  const markedCount = questions.filter((q) => reviewMarked[q.id]).length;
  const unansweredCount = totalQuestionsCount - answeredCount;

  // Adaptive Question Progression
  const handleAdaptiveNext = () => {
    if (currentQ) {
      const userAns = answers[currentQ.id];
      const isCorrect = currentQ.type === 'MCQ' && Number(userAns) === Number(currentQ.correctAnswer);

      if (isCorrect) {
        setAdaptiveDifficulty('HARD');
      } else {
        setAdaptiveDifficulty('EASY');
      }
    }
    nextQuestion();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Preparing assessment environment...</p>
      </div>
    );
  }

  // ==========================================
  // PRE-EXAM SCREEN
  // ==========================================
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg space-y-6">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                {exam?.subject}
              </span>
              {isProctoringActive && (
                <Badge variant="danger" size="sm" dot>
                  AI Proctoring Active
                </Badge>
              )}
              {isAdaptive && (
                <Badge variant="indigo" size="sm" dot>
                  Adaptive Testing
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {exam?.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {exam?.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Duration</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {exam?.duration} mins
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Questions</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {questions.length} Items
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Marks</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {exam?.totalMarks} Marks
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Passing Score</span>
              <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                {exam?.passingPercentage}%
              </p>
            </div>
          </div>

          {/* Smart Proctoring Camera Verification Box */}
          {isProctoringActive && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Mandatory Webcam & Proctoring Check
                </span>
                {cameraVerified && (
                  <Badge variant="emerald" size="sm" dot>
                    Webcam Verified
                  </Badge>
                )}
              </div>

              {cameraVerified ? (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <video
                      ref={preExamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  </div>
                  <div className="text-xs text-indigo-900/80 dark:text-indigo-200/80 space-y-1">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Face detection active & properly framed
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Browser lockdown and tab-switch sentinel will engage automatically upon start.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                    This examination requires active camera proctoring. You must grant camera access to ensure continuous identity validation and room framing.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Camera}
                    onClick={handleTestCamera}
                  >
                    Test & Initialize Webcam
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Candidate Guidelines & Rules
            </h4>
            <div className="text-xs text-amber-900/80 dark:text-amber-200/80 whitespace-pre-line leading-relaxed">
              {exam?.instructions}
            </div>
            {exam?.negativeMarking && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
                Notice: Negative marking is active (-{exam.negativeMarkValue} marks for each incorrect MCQ).
              </p>
            )}
            {isAdaptive && (
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Adaptive mode active: Questions will adapt dynamically based on your correctness. Free skipping is disabled.
              </p>
            )}
          </div>

          {/* Rules agreement checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-brand-600 focus:ring-brand-500 rounded"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-normal">
              I have read and agree to all rules, honesty principles, and time conditions specified for this examination.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                proctoring.stopCamera();
                navigate('/student/exams');
              }}
            >
              Back to Available Exams
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!agreedToRules || (isProctoringActive && !cameraVerified)}
              onClick={handleBeginAssessment}
              rightIcon={ChevronRight}
            >
              Start Exam Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE EXAM DISTRACTION-FREE SCREEN
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* Distraction-Free Header */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-soft-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            IQ
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs md:max-w-md">
              {exam?.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                Candidate: {user?.name || 'Alex Morgan'}
              </span>
              {isAdaptive && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                  Adaptive Level: {adaptiveDifficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Timer & Autosave */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold transition-all ${
              timer.isWarning
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${timer.isWarning ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
            <span>{timer.formattedTime}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isSaved ? 'Saved' : 'Saving...'}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobilePaletteOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Question Palette"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            rightIcon={Send}
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left/Center: Current Question Canvas */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft p-6 sm:p-8 min-h-[500px]">
          {currentQ ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Question {currentQuestionIndex + 1} of {totalQuestionsCount}
                  </span>
                  <Badge variant="brand" size="sm">
                    {currentQ.marks} Marks
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {currentQ.topic}
                  </Badge>
                  {isAdaptive && (
                    <Badge variant="indigo" size="sm">
                      Level: {adaptiveDifficulty}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReview(currentQ.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                      reviewMarked[currentQ.id]
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{reviewMarked[currentQ.id] ? 'Marked' : 'Mark for Review'}</span>
                  </button>

                  {answers[currentQ.id] !== undefined && answers[currentQ.id] !== '' && (
                    <button
                      type="button"
                      onClick={() => clearAnswer(currentQ.id)}
                      className="text-xs text-slate-400 hover:text-rose-500 transition-colors px-2 py-1"
                    >
                      Clear Answer
                    </button>
                  )}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {currentQ.text}
              </div>

              {/* Input: MCQ Options */}
              {currentQ.type === 'MCQ' && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((optionText, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;

                    return (
                      <label
                        key={optIdx}
                        onClick={() => setAnswer(currentQ.id, optIdx)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50/60 border-brand-500 dark:bg-brand-950/40 dark:border-brand-500 shadow-soft-xs ring-1 ring-brand-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {optionText}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Input: Short Answer Textarea */}
              {currentQ.type === 'SHORT_ANSWER' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your Response:
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your explanation or derivation clearly..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    className="w-full rounded-2xl p-4 text-sm bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Characters: {(answers[currentQ.id] || '').length} • Subjective evaluation applies.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">No question selected.</p>
          )}

          {/* Bottom Question Navigation Controls */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              disabled={currentQuestionIndex === 0 || isAdaptive}
              onClick={prevQuestion}
              leftIcon={ChevronLeft}
              title={isAdaptive ? 'Adaptive mode disables backward navigation' : undefined}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < totalQuestionsCount - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={isAdaptive ? handleAdaptiveNext : nextQuestion}
                  rightIcon={ChevronRight}
                >
                  Save & Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsSubmitModalOpen(true)}
                  rightIcon={Send}
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Question Palette */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft p-6 space-y-6 sticky top-24">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Question Palette
              </h3>
              <p className="text-xs text-slate-400">
                {isAdaptive ? 'Forward progression enforced in adaptive mode' : 'Click any number to jump directly'}
              </p>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md border-2 border-brand-500 bg-white dark:bg-slate-800" />
                <span className="text-slate-600 dark:text-slate-400">Current</span>
              </div>
            </div>

            {/* Numbered Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isMarked = reviewMarked[q.id];

                let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                if (isMarked) btnClass = 'bg-amber-500 text-white font-bold';
                else if (isAnswered) btnClass = 'bg-emerald-500 text-white font-bold';

                if (isCurrent) {
                  btnClass += ' ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={isAdaptive && idx !== currentQuestionIndex}
                    onClick={() => {
                      if (isAdaptive && idx !== currentQuestionIndex) {
                        toast.error('Adaptive mode requires sequential answers.');
                        return;
                      }
                      goToQuestion(idx);
                    }}
                    className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${btnClass} ${
                      isAdaptive && idx !== currentQuestionIndex ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit Quick Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => setIsSubmitModalOpen(true)}
              >
                Submit Assessment
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Smart Proctoring Thumbnail */}
      {isProctoringActive && isStarted && (
        <WebcamThumbnail
          cameraStream={proctoring.cameraStream}
          faceStatus={proctoring.faceStatus}
          riskScore={proctoring.riskScore}
          violationCount={proctoring.violationCount}
          maxViolations={proctoring.maxViolations}
        />
      )}

      {/* Proctoring Warning Modal on Violation */}
      {isProctoringActive && (
        <ProctoringWarningModal
          isOpen={proctoring.showWarningModal}
          onClose={() => proctoring.setShowWarningModal(false)}
          latestViolation={proctoring.latestViolation}
          violationCount={proctoring.violationCount}
          maxViolations={proctoring.maxViolations}
          onReenterFullscreen={proctoring.requestFullscreen}
        />
      )}

      {/* Mobile Off-canvas Palette Drawer */}
      <Modal
        isOpen={isMobilePaletteOpen}
        onClose={() => setIsMobilePaletteOpen(false)}
        title="Question Overview"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
              const isMarked = reviewMarked[q.id];

              let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
              if (isMarked) btnClass = 'bg-amber-500 text-white font-bold';
              else if (isAnswered) btnClass = 'bg-emerald-500 text-white font-bold';

              if (isCurrent) btnClass += ' ring-2 ring-brand-500 ring-offset-2';

              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={isAdaptive && idx !== currentQuestionIndex}
                  onClick={() => {
                    if (isAdaptive && idx !== currentQuestionIndex) {
                      toast.error('Adaptive mode requires sequential answers.');
                      return;
                    }
                    goToQuestion(idx);
                    setIsMobilePaletteOpen(false);
                  }}
                  className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center ${btnClass} ${
                    isAdaptive && idx !== currentQuestionIndex ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setIsMobilePaletteOpen(false)}
          >
            Close Overview
          </Button>
        </div>
      </Modal>

      {/* Confirm Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Confirm Final Submission?"
        description="Please review your attempt summary before submitting. Once submitted, you cannot edit your responses."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Answered</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {answeredCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] font-bold text-amber-600 uppercase">Marked</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                {markedCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Unanswered</span>
              <p className="text-xl font-black text-slate-700 dark:text-slate-300">
                {unansweredCount}
              </p>
            </div>
          </div>

          {unansweredCount > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
              Notice: You have {unansweredCount} unanswered questions. Unanswered questions will receive 0 marks.
            </p>
          )}

          {isProctoringActive && proctoring.riskScore > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <span className="text-slate-500">Security Telemetry Recorded:</span>
              <span className="font-bold text-rose-500">{proctoring.riskScore}% Cheating Risk</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Return to Exam
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              rightIcon={Send}
            >
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamAttempt;
