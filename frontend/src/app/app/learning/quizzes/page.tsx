'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, CheckCircle2, XCircle, Award, ShieldCheck, 
  ArrowRight, RefreshCw, BookOpen, Sparkles
} from 'lucide-react';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function LearningQuizzesPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      category: 'RISK',
      question: 'Under the Strict Safe Sizing Invariant, what happens if the calculated risk for even 1 share exceeds the 1.0% account risk budget?',
      options: [
        'The order is executed with a minimum size of 1 share.',
        'The order ticket automatically sizes to 0 units with a risk breach warning.',
        'The account equity is automatically increased via leverage.',
        'The stop-loss distance is arbitrarily compressed without user consent.'
      ],
      correctIndex: 1,
      explanation: 'Rule A Invariant dictates: Sizing must NEVER round up to a minimum of 1 unit. If the risk exceeds the 1.0% budget, sizing returns 0 units.'
    },
    {
      id: 2,
      category: 'RISK',
      question: 'When the Daily Drawdown Circuit Breaker triggers at 3.0% loss of starting equity, which action is enforced?',
      options: [
        'The platform doubles the position size to recover losses.',
        'All new opening orders are locked for the remainder of the session.',
        'The user is automatically switched to Pro Quant mode.',
        'Market data streams are paused.'
      ],
      correctIndex: 1,
      explanation: 'When realized + unrealized daily drawdown hits 3.0% of starting equity, all new opening orders are locked to protect capital.'
    },
    {
      id: 3,
      category: 'TECHNICALS',
      question: 'In the Basic (Guided) trading tier, what role does the 20-period Exponential Moving Average (EMA) play?',
      options: [
        'It is an arbitrary line with no statistical significance.',
        'It serves as the core equilibrium trend guide; price above indicates bullish bias.',
        'It generates guaranteed profit without requiring a stop-loss.',
        'It calculates the Black-Scholes implied volatility.'
      ],
      correctIndex: 1,
      explanation: 'The 20-EMA acts as dynamic support/resistance and trend equilibrium for systematic position alignment.'
    },
    {
      id: 4,
      category: 'OPTIONS',
      question: 'Which Greek measures the rate of decay of an option\'s extrinsic value as time to expiration advances?',
      options: [
        'Delta (Δ)',
        'Gamma (Γ)',
        'Theta (Θ)',
        'Vega (ν)'
      ],
      correctIndex: 2,
      explanation: 'Theta (Θ) represents time decay, indicating how much option premium erodes per calendar day holding all else constant.'
    },
    {
      id: 5,
      category: 'QUANT',
      question: 'What portfolio does Modern Portfolio Theory (MPT) identify along the Efficient Frontier that maximizes excess return per unit of volatility?',
      options: [
        'The Minimum Variance Portfolio',
        'The Maximum Sharpe Ratio (Tangency) Portfolio',
        'The Equal Weight (1/N) Portfolio',
        'The Inverse Volatility Portfolio'
      ],
      correctIndex: 1,
      explanation: 'The Maximum Sharpe Ratio (Tangency) Portfolio delivers the steepest slope from the risk-free rate to the efficient frontier curve.'
    }
  ];

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (submitted) return;
    setUserAnswers({ ...userAnswers, [qId]: optIdx });
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const filteredQuestions = selectedCategory === 'ALL'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  const score = calculateScore();
  const scorePct = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Quantitative & Risk Competency Quizzes</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                CERTIFICATION
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Test and certify your understanding of pre-trade risk invariants, Greeks, and quantitative modeling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {submitted ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>Retry Quiz</span>
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit for Certification</span>
            </button>
          )}
        </div>
      </div>

      {/* Score Banner when Submitted */}
      {submitted && (
        <div className="p-4 rounded-xl bg-[#111922] border border-[#25313D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#35C69A]/15 border border-[#35C69A]/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#35C69A]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#E7EDF3]">
                Score: {score} / {questions.length} ({scorePct}%)
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                {scorePct >= 80
                  ? 'Outstanding! You demonstrated mastery of institutional risk and quantitative invariants.'
                  : 'Review the detailed explanations below to strengthen your understanding of risk controls.'}
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
            scorePct >= 80 ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30' : 'bg-[#D8AB5E]/15 text-[#D8AB5E] border border-[#D8AB5E]/30'
          }`}>
            {scorePct >= 80 ? 'LEVEL 3: PRO QUANT CERTIFIED' : 'TIER 2: ACTIVE TRADER'}
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-2.5 bg-[#111922] rounded-xl border border-[#25313D] flex items-center gap-1.5">
        <span className="text-[11px] text-[#8B99A8] mr-2 font-mono">Category:</span>
        {['ALL', 'RISK', 'TECHNICALS', 'OPTIONS', 'QUANT'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
              selectedCategory === cat
                ? 'bg-[#2979FF] text-white font-bold'
                : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const selected = userAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = submitted && selected === q.correctIndex;
          const isWrong = submitted && isAnswered && !isCorrect;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl bg-[#111922] border transition-colors ${
                submitted
                  ? isCorrect
                    ? 'border-[#35C69A]/50 bg-[#35C69A]/5'
                    : 'border-[#EF6468]/50 bg-[#EF6468]/5'
                  : 'border-[#25313D]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
                  {q.category}
                </span>
                {submitted && (
                  <span className="flex items-center gap-1 text-[11px] font-mono">
                    {isCorrect ? (
                      <span className="text-[#35C69A] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                      </span>
                    ) : (
                      <span className="text-[#EF6468] flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </span>
                )}
              </div>

              <h3 className="text-xs font-bold text-[#E7EDF3] mb-3 leading-relaxed">
                {idx + 1}. {q.question}
              </h3>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  const isOptCorrect = submitted && optIdx === q.correctIndex;

                  let optClass = 'bg-[#0D131A] border-[#25313D] text-[#8B99A8] hover:border-[#8B99A8]/40';
                  if (submitted) {
                    if (isOptCorrect) {
                      optClass = 'bg-[#35C69A]/15 border-[#35C69A] text-[#35C69A] font-bold';
                    } else if (isOptSelected && !isOptCorrect) {
                      optClass = 'bg-[#EF6468]/15 border-[#EF6468] text-[#EF6468]';
                    }
                  } else if (isOptSelected) {
                    optClass = 'bg-[#2979FF]/15 border-[#2979FF] text-[#E7EDF3] font-semibold';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2.5 ${optClass}`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono ${
                        isOptSelected ? 'border-[#2979FF] bg-[#2979FF] text-white' : 'border-[#25313D] text-[#8B99A8]'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-[11px]">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[11px] text-[#8B99A8] leading-relaxed">
                  <strong className="text-[#E7EDF3]">Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
