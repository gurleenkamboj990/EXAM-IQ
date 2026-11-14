import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { questionApi } from '../../api/questionApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

const TOPIC_OPTIONS = [
  { value: 'ALL', label: 'All Topics' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Java', label: 'Java' },
  { value: 'DBMS', label: 'DBMS' },
  { value: 'Algorithms', label: 'Algorithms' },
  { value: 'Networks', label: 'Networks' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'ALL', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Question Types' },
  { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
];

export const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  // Filters
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [type, setType] = useState('ALL');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    text: '',
    topic: 'Computer Science',
    type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 2,
    options: ['', '', '', ''],
    correctAnswer: 0,
    modelAnswer: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirmation State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await questionApi.getAll({
        search,
        topic,
        difficulty,
        type,
        page,
        limit,
      });
      setQuestions(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  }, [search, topic, difficulty, type, page, limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      topic: 'Java',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 2,
      options: ['', '', '', ''],
      correctAnswer: 0,
      modelAnswer: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      text: q.text,
      topic: q.topic,
      type: q.type,
      difficulty: q.difficulty,
      marks: q.marks,
      options: q.options ? [...q.options] : ['', '', '', ''],
      correctAnswer: q.correctAnswer ?? 0,
      modelAnswer: q.modelAnswer || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.text.trim()) errors.text = 'Question prompt cannot be empty.';
    if (!formData.topic.trim()) errors.topic = 'Topic is required.';
    if (!formData.marks || formData.marks <= 0) errors.marks = 'Marks must be greater than 0.';

    if (formData.type === 'MCQ') {
      const hasEmptyOption = formData.options.some((opt) => !opt.trim());
      if (hasEmptyOption) errors.options = 'All 4 options must be filled.';
    } else if (formData.type === 'SHORT_ANSWER') {
      if (!formData.modelAnswer.trim()) errors.modelAnswer = 'Model answer is required for reference.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingQuestion) {
        await questionApi.update(editingQuestion.id, formData);
        toast.success('Question updated successfully');
      } else {
        await questionApi.create(formData);
        toast.success('Question created successfully');
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.message || 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await questionApi.delete(deleteTargetId);
      toast.success('Question deleted successfully');
      setDeleteTargetId(null);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadgeVariant = (diff) => {
    switch (diff) {
      case 'EASY':
        return 'emerald';
      case 'MEDIUM':
        return 'amber';
      case 'HARD':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Question Bank
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, categorize, and organize questions across academic disciplines
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={Plus}
          onClick={handleOpenAddModal}
        >
          Add New Question
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search questions or topics..."
          leftIcon={Search}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <Select
          options={TOPIC_OPTIONS}
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setPage(1);
          }}
        />

        <Select
          options={DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        />

        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Questions Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions match your criteria"
          description="Try broadening your filters or add a new question to your curriculum bank."
          actionLabel="Add Question"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Question</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-lg">
                      {q.text}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.topic}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={q.type === 'MCQ' ? 'brand' : 'indigo'} size="sm">
                      {q.type === 'MCQ' ? 'MCQ' : 'Short Answer'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDifficultyBadgeVariant(q.difficulty)} size="sm" dot>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    {q.marks} pts
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Showing {questions.length} of {total} questions
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={ChevronLeft}
              >
                Previous
              </Button>
              <span className="font-bold text-slate-700 dark:text-slate-300 px-1">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question to Bank'}
        description="Provide comprehensive details and define the scoring criteria"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <Input
            label="Question Prompt"
            placeholder="Type your question statement here..."
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            error={formErrors.text}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Topic / Subject"
              placeholder="e.g. Java, Physics, DBMS"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              error={formErrors.topic}
              required
            />

            <Select
              label="Question Type"
              options={[
                { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
                { value: 'SHORT_ANSWER', label: 'Short Answer' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />

            <Select
              label="Difficulty Level"
              options={[
                { value: 'EASY', label: 'Easy' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HARD', label: 'Hard' },
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              required
            />
          </div>

          <div className="w-32">
            <Input
              label="Marks / Points"
              type="number"
              min="1"
              max="50"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
              error={formErrors.marks}
              required
            />
          </div>

          {/* Conditional: MCQ Options */}
          {formData.type === 'MCQ' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Multiple Choice Options & Correct Answer
                </label>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                  Select the radio button next to the correct option
                </span>
              </div>

              {formErrors.options && (
                <p className="text-xs text-rose-500 font-medium">{formErrors.options}</p>
              )}

              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctAnswer === idx}
                      onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </label>

                  <Input
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[idx] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Conditional: Short Answer Model Answer */}
          {formData.type === 'SHORT_ANSWER' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Model Answer / Grading Rubric
              </label>
              <textarea
                rows={3}
                placeholder="Key concepts, phrases, and expected points for teacher review..."
                value={formData.modelAnswer}
                onChange={(e) => setFormData({ ...formData, modelAnswer: e.target.value })}
                className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {formErrors.modelAnswer && (
                <p className="text-xs text-rose-500 font-medium">{formErrors.modelAnswer}</p>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question?"
        message="This question will be permanently removed from your question library. It cannot be recovered."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default QuestionBank;
