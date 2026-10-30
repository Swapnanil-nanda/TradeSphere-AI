'use client';

import React, { useState } from 'react';
import { GraduationCap, BookOpen, CheckCircle2, ShieldCheck, ArrowRight, Award, HelpCircle, Check, X } from 'lucide-react';
import Link from 'next/link';

interface CourseModule {
  id: string;
  title: string;
  tier: 'Basic' | 'Active' | 'Pro';
  estimatedTime: string;
  summary: string;
  lessons: string[];
  completed: boolean;
}

export default function LearningPage() {
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: 'mod-1',
      title: 'Module 1: The 1% Account-Risk Rule & Capital Preservation',
      tier: 'Basic',
      estimatedTime: '15 mins',
      summary: 'Learn how professional risk managers size positions so no single bad trade can damage long-term capital.',
      lessons: [
        'Why position size is calculated from the Stop-Loss, not available cash',
        'Mathematical proof: 20 consecutive losses at 1% risk leaves 81.8% equity intact',
        'Setting mandatory hard Stop-Loss orders prior to execution'
      ],
      completed: true
    },
    {
      id: 'mod-2',
      title: 'Module 2: Dynamic Trend Regimes with 20-EMA & VWAP',
      tier: 'Active',
      estimatedTime: '20 mins',
      summary: 'Distinguish between trending and mean-reverting market conditions using exponential moving averages and session VWAP.',
      lessons: [
        'The 20-EMA slope as a trend direction filter',
        'Equilibrium VWAP: identifying institutional value areas',
        'Dynamic Support & Resistance zones in Indian and US equities'
      ],
      completed: true
    },
    {
      id: 'mod-3',
      title: 'Module 3: Bracket OCO (One-Cancels-the-Other) Orders',
      tier: 'Active',
      estimatedTime: '25 mins',
      summary: 'Automate trade exits with synchronized Take-Profit and Stop-Loss orders.',
      lessons: [
        'How OCO child legs are managed by the execution state machine',
        'Risk-to-Reward ratio optimization (targeting minimum 1.5R)',
        'Trailing stop adjustments during strong breakout trends'
      ],
      completed: false
    },
    {
      id: 'mod-4',
      title: 'Module 4: Level 2 Depth of Market (DOM) Order Flow',
      tier: 'Pro',
      estimatedTime: '30 mins',
      summary: 'Read the 20-depth order book ladder to detect institutional liquidity, bid/ask walls, and spoofing.',
      lessons: [
        'Interpreting bid-ask spreads and liquidity depth',
        'Cumulative delta and micro-price movements',
        'Execution queues and simulated slip models'
      ],
      completed: false
    },
    {
      id: 'mod-5',
      title: 'Module 5: Black-Scholes Options Greeks & Volatility Surface',
      tier: 'Pro',
      estimatedTime: '35 mins',
      summary: 'Master Delta, Gamma, Theta, Vega, and Implied Volatility calculation via Newton-Raphson.',
      lessons: [
        'Delta hedging and Gamma curvature risk',
        'Theta decay curves approaching weekly expiry',
        'Vega exposure and IV skew across strike prices'
      ],
      completed: false
    }
  ]);

  // Quiz state
  const quizQuestions = [
    {
      question: 'Under TradeSphere AI Rule A, what is the maximum single-trade risk allowed on a ₹10,00,000 account?',
      options: ['₹50,000 (5.0%)', '₹10,000 (1.0%)', '₹1,00,000 (10.0%)', 'Whatever margin is available'],
      correctIndex: 1,
      explanation: 'TradeSphere AI strictly limits maximum single-trade loss to 1.0% of account equity (₹10,000 on a ₹10L starting balance).'
    },
    {
      question: 'If your entry price is ₹3,000 and your Stop-Loss is ₹2,950, what is your risk per share?',
      options: ['₹3,000', '₹100', '₹50', '₹2,950'],
      correctIndex: 2,
      explanation: 'Risk per share = Entry (₹3,000) - Stop-Loss (₹2,950) = ₹50.'
    },
    {
      question: 'When a bracket OCO order fills its Take-Profit leg, what happens to the Stop-Loss leg?',
      options: [
        'It remains active until manually canceled',
        'It turns into a market sell order',
        'It is immediately and automatically canceled by the OMS state machine',
        'It doubles the position size'
      ],
      correctIndex: 2,
      explanation: 'One-Cancels-the-Other (OCO) child legs monitor each other; when one triggers, the counter-leg is immediately canceled.'
    }
  ];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const toggleModuleCompletion = (id: string) => {
    setModules(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const completedCount = modules.filter(m => m.completed).length;
  const progressPct = Math.round((completedCount / modules.length) * 100);

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (!submittedQuiz) {
      setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score += 1;
    });
    return score;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Learning Academy &amp; Risk Mastery
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FREE CURRICULUM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Systematic education in risk management, market structure, bracket orders, and quant analytics.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="bg-[#0c121f] border border-[#1b253b] px-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {completedCount}/{modules.length}
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Course Progress</span>
            <span className="text-xs font-mono font-bold text-white">{progressPct}% Complete</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#0c121f] rounded-full overflow-hidden border border-[#1b253b]">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Course Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Core Interactive Curriculum</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(mod => (
            <div
              key={mod.id}
              className={`bg-[#0c121f] border rounded-2xl p-5 shadow-xl transition-all ${
                mod.completed ? 'border-emerald-500/30' : 'border-[#1b253b]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  mod.tier === 'Basic' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  mod.tier === 'Active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {mod.tier} Mode
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{mod.estimatedTime}</span>
              </div>

              <h3 className="font-extrabold text-sm text-white mb-2">{mod.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{mod.summary}</p>

              <div className="space-y-1.5 mb-4">
                {mod.lessons.map((les, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{les}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#1b253b] flex items-center justify-between">
                <button
                  onClick={() => toggleModuleCompletion(mod.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mod.completed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{mod.completed ? 'Completed' : 'Mark as Done'}</span>
                </button>

                <Link
                  href="/app/paper-trading"
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>Practice in Terminal</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Risk Mastery Quiz */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b253b]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Interactive Risk Mastery Quiz
              </h2>
              <p className="text-xs text-slate-400">
                Test your understanding of TradeSphere AI risk guardrails and order routing.
              </p>
            </div>
          </div>

          {submittedQuiz && (
            <div className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-xs font-mono">
              Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3 bg-[#070b14] p-4 rounded-xl border border-[#1b253b]">
              <div className="font-extrabold text-xs text-white flex items-start gap-2">
                <span className="text-blue-400 font-mono">Q{qIdx + 1}.</span>
                <span>{q.question}</span>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  const isCorrect = q.correctIndex === oIdx;

                  let optClass = 'bg-[#0c121f] text-slate-300 border-[#1b253b] hover:border-slate-700';
                  if (submittedQuiz) {
                    if (isCorrect) optClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
                    else if (isSelected && !isCorrect) optClass = 'bg-rose-500/10 text-rose-300 border-rose-500/40';
                  } else if (isSelected) {
                    optClass = 'bg-blue-600 text-white border-blue-500 shadow-md';
                  }

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(qIdx, oIdx)}
                      className={`p-2.5 px-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {submittedQuiz && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      {submittedQuiz && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400" />}
                    </div>
                  );
                })}
              </div>

              {submittedQuiz && (
                <div className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <span className="font-bold text-blue-300">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          {!submittedQuiz ? (
            <button
              onClick={() => setSubmittedQuiz(true)}
              disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedAnswers({});
                setSubmittedQuiz(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
