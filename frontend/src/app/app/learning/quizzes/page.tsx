'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HelpCircle, CheckCircle2, XCircle, Award, ShieldCheck,
  ArrowRight, RefreshCw, BookOpen, Sparkles, Filter, Check, X,
  ExternalLink, Zap
} from 'lucide-react';
import {
  ACADEMY_QUIZ_QUESTIONS,
  AcademyQuizQuestion
} from '../../../../lib/academy-data';

function QuizzesContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'ALL';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(false);

  // Filtered question set
  const filteredQuestions = useMemo(() => {
    return ACADEMY_QUIZ_QUESTIONS.filter(q => {
      const matchCat = selectedCategory === 'ALL' || q.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });
  }, [selectedCategory, selectedDifficulty]);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const score = useMemo(() => {
    let count = 0;
    filteredQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) count++;
    });
    return count;
  }, [filteredQuestions, userAnswers]);

  const total = filteredQuestions.length;
  const scorePct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isAllAnswered = filteredQuestions.every(q => userAnswers[q.id] !== undefined);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-5 rounded-xl border border-[#25313D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#35C69A]/10 text-[#35C69A] border border-[#35C69A]/30 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Interactive Trader Academy Quizzes
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                {ACADEMY_QUIZ_QUESTIONS.length} QUESTIONS
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1">
              Verify your comprehension of risk mathematics, order flow, options Greeks, MPT, and quant agent validation.
            </p>
          </div>
        </div>

        {/* Live Score Counter or Status */}
        {submitted ? (
          <div className="bg-[#111922] border border-[#25313D] px-4 py-2 rounded-xl flex items-center gap-3 shrink-0 font-mono">
            <div>
              <span className="text-[10px] text-[#8B99A8] block font-sans">Final Score</span>
              <span className={`text-base font-extrabold ${scorePct >= 80 ? 'text-[#35C69A]' : scorePct >= 60 ? 'text-[#D8AB5E]' : 'text-[#EF6468]'}`}>
                {score} / {total} ({scorePct}%)
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-bold ${
              scorePct >= 80 ? 'bg-[#35C69A]/15 text-[#35C69A]' : 'bg-[#D8AB5E]/15 text-[#D8AB5E]'
            }`}>
              {scorePct >= 90 ? 'Mastery' : scorePct >= 70 ? 'Proficient' : 'Review Required'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-[#111922] border border-[#25313D] px-3.5 py-2 rounded-xl font-mono text-xs text-[#8B99A8]">
              Answered: <b className="text-white">{Object.keys(userAnswers).length}</b> / {total}
            </div>

            <button
              onClick={() => setInstantFeedback(!instantFeedback)}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                instantFeedback
                  ? 'bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/40'
                  : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
              }`}
            >
              Instant Feedback: {instantFeedback ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111922] p-3 rounded-xl border border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1">
          {['ALL', 'BEGINNER', 'RISK', 'TECHNICAL', 'OPTIONS', 'WEALTH', 'QUANT'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                handleReset();
              }}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2979FF] text-white border-[#2979FF] font-bold'
                  : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-[#8B99A8] font-sans">Level:</span>
          {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                handleReset();
              }}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-[#35C69A] text-black border-[#35C69A] font-bold'
                  : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-[#111922] p-8 text-center rounded-xl border border-[#25313D] text-xs text-[#8B99A8] font-mono">
            No questions available for the selected category and level filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const selectedOpt = userAnswers[q.id];
            const isCorrect = selectedOpt === q.correctIndex;
            const showAnswers = submitted || (instantFeedback && selectedOpt !== undefined);

            return (
              <div
                key={q.id}
                className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#25313D]/60 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0D131A] text-[#2979FF] border border-[#25313D] font-bold">
                      {q.category}
                    </span>
                    <span className="text-[#8B99A8] font-sans">• {q.difficulty} Level</span>
                  </div>
                  <span className="text-[#8B99A8]">Q{idx + 1} of {total}</span>
                </div>

                <div className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {q.question}
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1 font-sans">
                  {q.options.map((opt, optIdx) => {
                    const isThisSelected = selectedOpt === optIdx;
                    const isThisCorrect = q.correctIndex === optIdx;

                    let optStyle = 'bg-[#0D131A] border-[#25313D] text-[#8B99A8] hover:text-white hover:border-[#25313D]/80';

                    if (showAnswers) {
                      if (isThisCorrect) {
                        optStyle = 'bg-[#35C69A]/15 border-[#35C69A] text-white font-bold';
                      } else if (isThisSelected && !isThisCorrect) {
                        optStyle = 'bg-[#EF6468]/15 border-[#EF6468] text-[#EF6468]';
                      }
                    } else if (isThisSelected) {
                      optStyle = 'bg-[#2979FF]/15 border-[#2979FF] text-white font-bold shadow-xs';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#111922] border border-[#25313D] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {showAnswers && isThisCorrect && (
                          <Check className="w-4 h-4 text-[#35C69A] shrink-0" />
                        )}
                        {showAnswers && isThisSelected && !isThisCorrect && (
                          <X className="w-4 h-4 text-[#EF6468] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answer Explanation & Feature Practicing Link */}
                {showAnswers && (
                  <div className="p-3 bg-[#0D131A] border border-[#25313D] rounded-lg space-y-2 mt-2">
                    <div className="text-xs text-[#8B99A8] leading-relaxed">
                      <strong className={isCorrect ? 'text-[#35C69A]' : 'text-[#EF6468]'}>
                        {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                      </strong>
                      <span className="text-[#E7EDF3]">{q.explanation}</span>
                    </div>

                    <div className="pt-2 border-t border-[#25313D]/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#8B99A8]">Verify in Workstation:</span>
                      <Link
                        href={q.relatedFeatureRoute}
                        className="inline-flex items-center gap-1 text-[#2979FF] hover:underline font-bold"
                      >
                        <span>Open Feature ({q.relatedFeatureRoute})</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Evaluation Action Bar */}
      {filteredQuestions.length > 0 && (
        <div className="bg-[#0D131A] border border-[#25313D] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 shadow-xl">
          <div className="text-xs text-[#8B99A8] font-mono">
            {submitted ? (
              <span>Evaluation complete. Click below to re-attempt or switch categories.</span>
            ) : (
              <span>Select an answer for each question and click Submit for instant grading.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {submitted ? (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111922] hover:bg-[#25313D] text-white font-mono text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-take Quiz</span>
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                disabled={!isAllAnswered}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                  isAllAnswered
                    ? 'bg-[#35C69A] hover:bg-[#2cb188] text-black shadow-emerald-500/20'
                    : 'bg-[#111922] text-[#8B99A8] border border-[#25313D] cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Answers for Evaluation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#8B99A8]">Loading quizzes...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}
