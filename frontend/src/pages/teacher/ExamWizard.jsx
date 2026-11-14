import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Sliders,
  Calendar,
  Clock,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { examApi } from '../../api/examApi';
import { questionApi } from '../../api/questionApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

// Step Validation Schemas
const step1Schema = z.object({
  title: z.string().min(3, 'Exam title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().min(10, 'Please provide a clear description (at least 10 chars)'),
  instructions: z.string().min(10, 'Please provide instructions for candidates'),
});

const step3Schema = z.object({
  startTime: z.string().min(1, 'Start date and time is required'),
  duration: z.coerce.number().min(5, 'Duration must be at least 5 minutes').max(360, 'Maximum 360 minutes'),
  passingPercentage: z.coerce.number().min(10, 'Passing % must be between 10 and 100').max(100),
  negativeMarking: z.boolean().default(false),
  negativeMarkValue: z.coerce.number().min(0).default(0.5),
  shuffleQuestions: z.boolean().default(true),
  adaptiveMode: z.boolean().default(false),
  proctoring: z.boolean().default(false),
});

const STEPS = [
  { id: 1, title: 'Details', desc: 'Title & Instructions' },
  { id: 2, title: 'Questions', desc: 'Select from Bank' },
  { id: 3, title: 'Schedule & Settings', desc: 'Duration & Rules' },
  { id: 4, title: 'Review & Publish', desc: 'Confirm & Finalize' },
];

export const ExamWizard = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available questions in the bank
  const [allQuestions, setAllQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');

  // Selected Question IDs
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Form 1 Setup
  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: '',
      subject: 'Computer Science',
      description: '',
      instructions: '1. Maintain a reliable internet connection throughout the test.\n2. Do not switch browser tabs.\n3. Verify all answers prior to final submission.',
    },
  });

  // Form 3 Setup
  const defaultStartTime = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16);
  const form3 = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      startTime: defaultStartTime,
      duration: 60,
      passingPercentage: 60,
      negativeMarking: false,
      negativeMarkValue: 0.5,
      shuffleQuestions: true,
      adaptiveMode: false,
      proctoring: false,
    },
  });

  // Load existing exam if in edit mode
  useEffect(() => {
    if (isEditMode) {
      examApi
        .getById(id, false)
        .then((exam) => {
          form1.reset({
            title: exam.title,
            subject: exam.subject,
            description: exam.description,
            instructions: exam.instructions,
          });
          setSelectedQuestionIds(exam.questionIds || []);

          const formattedStart = exam.startTime
            ? new Date(exam.startTime).toISOString().slice(0, 16)
            : defaultStartTime;

          form3.reset({
            startTime: formattedStart,
            duration: exam.duration || 60,
            passingPercentage: exam.passingPercentage || 60,
            negativeMarking: Boolean(exam.negativeMarking),
            negativeMarkValue: exam.negativeMarkValue || 0.5,
            shuffleQuestions: Boolean(exam.shuffleQuestions),
            adaptiveMode: Boolean(exam.adaptiveMode),
            proctoring: Boolean(exam.proctoring),
          });
        })
        .catch(() => {
          toast.error('Failed to load examination details.');
          navigate('/teacher/exams');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditMode, navigate]);

  // Load question bank for Step 2
  useEffect(() => {
    setIsQuestionsLoading(true);
    questionApi
      .getAll({ limit: 100 })
      .then((res) => {
        setAllQuestions(res.data || []);
      })
      .catch(() => toast.error('Unable to fetch questions for picker.'))
      .finally(() => setIsQuestionsLoading(false));
  }, []);

  // Filtered Questions in Step 2
  const filteredQuestions = allQuestions.filter((q) => {
    const matchSearch =
      q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    const matchTopic = selectedTopic === 'ALL' || q.topic.toLowerCase() === selectedTopic.toLowerCase();
    return matchSearch && matchTopic;
  });

  const selectedQuestions = allQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  const totalCalculatedMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  // Toggle selection
  const handleToggleQuestion = (qid) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qid) ? prev.filter((item) => item !== qid) : [...prev, qid]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const newSelection = Array.from(new Set([...selectedQuestionIds, ...filteredIds]));
    setSelectedQuestionIds(newSelection);
  };

  const handleClearFiltered = () => {
    const filteredIds = new Set(filteredQuestions.map((q) => q.id));
    setSelectedQuestionIds((prev) => prev.filter((id) => !filteredIds.has(id)));
  };

  // Step Navigation & Validation
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form1.trigger();
      if (!isValid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedQuestionIds.length === 0) {
        toast.error('Please pick at least one question for the exam.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const isValid = await form3.trigger();
      if (!isValid) return;
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final Publish
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const details = form1.getValues();
      const settings = form3.getValues();

      const startTime = new Date(settings.startTime).toISOString();
      const endTime = new Date(
        new Date(settings.startTime).getTime() + (Number(settings.duration) || 60) * 60 * 1000
      ).toISOString();

      const payload = {
        ...details,
        ...settings,
        startTime,
        endTime,
        questionIds: selectedQuestionIds,
        totalMarks: totalCalculatedMarks,
      };

      if (isEditMode) {
        await examApi.update(id, payload);
        toast.success('Examination updated successfully!');
      } else {
        await examApi.create(payload);
        toast.success('Examination created and published!');
      }

      navigate('/teacher/exams');
    } catch (err) {
      toast.error(err.message || 'Failed to publish examination.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {isEditMode ? 'Edit Examination' : 'Create New Examination'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Design questions, define time schedules, and configure grading parameters
          </p>
        </div>

        <Link to="/teacher/exams">
          <Button variant="outline" size="sm">
            Cancel & Exit
          </Button>
        </Link>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-50/80 border-brand-300 dark:bg-brand-950/40 dark:border-brand-600 shadow-soft-xs'
                  : isDone
                  ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        {/* STEP 1: Details */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Step 1: Exam Details & Syllabus
              </h3>
              <p className="text-xs text-slate-500">Provide basic identification and guidelines</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Exam Title"
                    placeholder="e.g. Advanced Data Structures & Algorithms Midterm"
                    error={form1.formState.errors.title?.message}
                    required
                    {...form1.register('title')}
                  />
                </div>
                <div>
                  <Input
                    label="Subject / Module"
                    placeholder="e.g. Computer Science"
                    error={form1.formState.errors.subject?.message}
                    required
                    {...form1.register('subject')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Exam Description / Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the core topics covered in this examination..."
                  className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...form1.register('description')}
                />
                {form1.formState.errors.description && (
                  <p className="mt-1 text-xs text-rose-500">
                    {form1.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Candidate Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide exam ground rules, calculator permissions, negative marking notes..."
                  className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...form1.register('instructions')}
                />
                {form1.formState.errors.instructions && (
                  <p className="mt-1 text-xs text-rose-500">
                    {form1.formState.errors.instructions.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Questions Selection */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Step 2: Question Selection
                </h3>
                <p className="text-xs text-slate-500">
                  Select questions from your library to attach to this exam paper
                </p>
              </div>

              {/* Running summary badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {selectedQuestionIds.length} Selected
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {totalCalculatedMarks} Total Marks
                </span>
              </div>
            </div>

            {/* Filter tools */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Search questions by text or topic..."
                leftIcon={Search}
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
              />

              <Select
                options={[
                  { value: 'ALL', label: 'All Topics' },
                  { value: 'Mathematics', label: 'Mathematics' },
                  { value: 'Physics', label: 'Physics' },
                  { value: 'Java', label: 'Java' },
                  { value: 'DBMS', label: 'DBMS' },
                  { value: 'Algorithms', label: 'Algorithms' },
                  { value: 'Networks', label: 'Networks' },
                ]}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllFiltered}
                  className="flex-1"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFiltered}
                  className="flex-1 text-slate-500"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Questions Picker List */}
            {isQuestionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No matching questions"
                description="Try another search term or topic filter."
              />
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60 pr-2">
                {filteredQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);

                  return (
                    <label
                      key={q.id}
                      onClick={() => handleToggleQuestion(q.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-brand-50/50 border-brand-300 dark:bg-brand-950/30 dark:border-brand-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {q.topic}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {q.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {q.marks} pts
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {q.text}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Schedule and Settings */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Step 3: Schedule & Examination Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure timing constraints, grading policy, and test integrity settings
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Start Date & Time (UTC/Local)"
                type="datetime-local"
                error={form3.formState.errors.startTime?.message}
                required
                {...form3.register('startTime')}
              />

              <Input
                label="Duration (Minutes)"
                type="number"
                min="5"
                max="360"
                error={form3.formState.errors.duration?.message}
                required
                {...form3.register('duration')}
              />

              <Input
                label="Passing Percentage (%)"
                type="number"
                min="10"
                max="100"
                error={form3.formState.errors.passingPercentage?.message}
                required
                {...form3.register('passingPercentage')}
              />
            </div>

            {/* Toggle settings */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grading & Test Delivery Parameters
              </h4>

              {/* Negative marking */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Negative Marking
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Deduct points for incorrect multiple choice answers
                  </p>
                  {form3.watch('negativeMarking') && (
                    <div className="pt-2 w-48">
                      <Input
                        label="Deduction per wrong answer"
                        type="number"
                        step="0.25"
                        min="0"
                        max="5"
                        {...form3.register('negativeMarkValue')}
                      />
                    </div>
                  )}
                </div>

                <Controller
                  name="negativeMarking"
                  control={form3.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
                    />
                  )}
                />
              </div>

              {/* Shuffle Questions */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Shuffle Question Sequence
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Randomizes the display order for each candidate
                  </p>
                </div>
                <Controller
                  name="shuffleQuestions"
                  control={form3.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
                    />
                  )}
                />
              </div>

              {/* Adaptive Mode (UI Only) */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Adaptive Testing Mode
                    </span>
                    <Badge variant="amber" size="sm">Phase 3 Feature</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dynamically varies question difficulty based on student response accuracy
                  </p>
                </div>
                <Controller
                  name="adaptiveMode"
                  control={form3.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
                    />
                  )}
                />
              </div>

              {/* Proctoring Mode (UI Only) */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Automated Proctoring & Browser Lockdown
                    </span>
                    <Badge variant="amber" size="sm">Phase 3 Feature</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Webcam monitoring, tab-switch anomaly detection, and full-screen enforcement
                  </p>
                </div>
                <Controller
                  name="proctoring"
                  control={form3.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review and Publish */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Step 4: Final Review & Publish
              </h3>
              <p className="text-xs text-slate-500">
                Verify all assessment parameters before making the exam live for learners
              </p>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Exam Title & Subject
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {form1.getValues('title')}
                </p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  Module: {form1.getValues('subject')}
                </p>
                <p className="text-xs text-slate-500 leading-normal pt-1">
                  {form1.getValues('description')}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Schedule & Evaluation
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block">Start Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(form3.getValues('startTime')).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {form3.getValues('duration')} minutes
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Questions</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {selectedQuestionIds.length} Questions
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Marks</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {totalCalculatedMarks} Marks
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Passing Benchmark</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {form3.getValues('passingPercentage')}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Negative Marking</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {form3.getValues('negativeMarking')
                        ? `Yes (-${form3.getValues('negativeMarkValue')} pts)`
                        : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Selected Table Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Questions ({selectedQuestions.length})
              </span>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 text-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-lg">
                        {q.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {q.topic}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {q.marks} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer / Buttons */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between rounded-b-2xl">
          <Button
            variant="outline"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            leftIcon={ChevronLeft}
          >
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={ChevronRight}
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              rightIcon={ArrowRight}
            >
              {isEditMode ? 'Update & Save Exam' : 'Publish Examination'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExamWizard;
