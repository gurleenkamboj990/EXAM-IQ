import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Save,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Plus,
  HelpCircle,
  BookOpen,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { aiApi } from '../../api/aiApi';
import { questionApi } from '../../api/questionApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export const AiQuestionGenerator = () => {
  const [topic, setTopic] = useState('Java Multithreading & Memory Model');
  const [notes, setNotes] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [type, setType] = useState('MCQ');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !notes.trim()) {
      toast.error('Please enter a topic or paste course lecture notes.');
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedIds([]);

    try {
      const results = await aiApi.generateQuestions({
        topic,
        notes,
        count,
        difficulty,
        type,
      });

      setGeneratedQuestions(results);
      setSelectedIds(results.map((q) => q.id));
      toast.success(`Generated ${results.length} assessment items successfully!`);
    } catch (err) {
      toast.error('AI question generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === generatedQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(generatedQuestions.map((q) => q.id));
    }
  };

  const handleDeleteCard = (id) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast.success('Removed card from preview');
  };

  const handleSaveSelected = async () => {
    const toSave = generatedQuestions.filter((q) => selectedIds.includes(q.id));
    if (toSave.length === 0) {
      toast.error('Please select at least one question to save.');
      return;
    }

    setIsSaving(true);
    try {
      for (const item of toSave) {
        await questionApi.create({
          text: item.text,
          topic: item.topic,
          type: item.type,
          difficulty: item.difficulty,
          marks: item.marks || 2,
          options: item.options || [],
          correctAnswer: item.correctAnswer ?? 0,
          modelAnswer: item.modelAnswer || '',
        });
      }

      toast.success(`Successfully saved ${toSave.length} question(s) to Question Bank!`);
      // Remove saved ones from staging
      setGeneratedQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to save questions to bank.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCardField = (id, field, value) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-0.5 rounded-full">
              Intelligent Synthesis
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600" />
            AI Question Generator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Synthesize academic exam questions with option distractors, difficulty calibration, and model rubrics
          </p>
        </div>
      </div>

      {/* Generator Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Parameters</CardTitle>
          <CardDescription>
            Input high-yield topics or paste raw lecture transcripts and textbook excerpts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject / Core Topic"
              placeholder="e.g. Distributed Consensus Algorithms, Java Concurrency, Quantum Mechanics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Number of Qs"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />

              <Select
                label="Difficulty"
                options={[
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                  { value: 'MIXED', label: 'Mixed Difficulty' },
                ]}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              />

              <Select
                label="Format"
                options={[
                  { value: 'MCQ', label: 'MCQ' },
                  { value: 'SHORT_ANSWER', label: 'Short Answer' },
                  { value: 'MIXED', label: 'Mixed' },
                ]}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Paste Notes / Syllabus Excerpt (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Paste raw notes, code snippets, or textbook paragraphs here to ground the generated questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl text-sm bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Target pool: {count} {difficulty.toLowerCase()} questions
            </span>

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={isGenerating}
              leftIcon={Wand2}
            >
              {isGenerating ? 'Synthesizing with AI...' : 'Generate Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions Staging Area */}
      {isGenerating ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold">
              Analyzing topic concepts and formulating distractors with ExamIQ AI...
            </span>
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : generatedQuestions.length > 0 ? (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={selectedIds.length === generatedQuestions.length && generatedQuestions.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Select All ({selectedIds.length} of {generatedQuestions.length})</span>
              </label>

              <Badge variant="brand" size="sm">
                Generated {generatedQuestions.length} Questions
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                leftIcon={RefreshCw}
              >
                Regenerate
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSelected}
                isLoading={isSaving}
                leftIcon={Save}
              >
                Save Selected to Bank ({selectedIds.length})
              </Button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => {
              const isSelected = selectedIds.includes(q.id);
              const isEditing = editingCardId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-brand-300 dark:border-brand-700 shadow-soft'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(q.id)}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <Badge variant="brand" size="sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {q.type}
                      </Badge>
                      <Badge
                        variant={
                          q.difficulty === 'EASY'
                            ? 'emerald'
                            : q.difficulty === 'MEDIUM'
                            ? 'amber'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {q.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCardId(isEditing ? null : q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit question text and options"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete question card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="pt-4 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          label="Question Prompt"
                          value={q.text}
                          onChange={(e) => updateCardField(q.id, 'text', e.target.value)}
                        />
                        {q.type === 'MCQ' && q.options && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              Options (Click radio to set correct answer):
                            </label>
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={q.correctAnswer === optIdx}
                                  onChange={() => updateCardField(q.id, 'correctAnswer', optIdx)}
                                />
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const nextOpts = [...q.options];
                                    nextOpts[optIdx] = e.target.value;
                                    updateCardField(q.id, 'options', nextOpts);
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'SHORT_ANSWER' && (
                          <textarea
                            rows={2}
                            value={q.modelAnswer}
                            onChange={(e) => updateCardField(q.id, 'modelAnswer', e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        )}
                        <Button variant="secondary" size="sm" onClick={() => setEditingCardId(null)}>
                          Done Editing
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {q.text}
                        </h4>

                        {q.type === 'MCQ' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  q.correctAnswer === optIdx
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                {q.correctAnswer === optIdx && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    Correct
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'SHORT_ANSWER' && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Model Rubric Answer
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {q.modelAnswer}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AiQuestionGenerator;

