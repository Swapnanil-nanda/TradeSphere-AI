import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FREE_EXTERNAL_RESOURCES,
  PLATFORM_FEATURE_GUIDES,
  PLATFORM_FAQS,
  ACADEMY_QUIZ_QUESTIONS,
  PRACTICAL_EXERCISES
} from './academy-data';

describe('Trader Academy & Platform Knowledge Base Invariants', () => {
  it('1. Free External Resources: contains at least 6 verified institutional video series/courses', () => {
    assert.ok(FREE_EXTERNAL_RESOURCES.length >= 6, `Expected at least 6 resources, found ${FREE_EXTERNAL_RESOURCES.length}`);
    const providers = FREE_EXTERNAL_RESOURCES.map(r => r.provider);
    assert.ok(providers.some(p => p.includes('Zerodha')), 'Must include Zerodha Varsity');
    assert.ok(providers.some(p => p.includes('MIT') || p.includes('Massachusetts')), 'Must include MIT OCW');
    assert.ok(providers.some(p => p.includes('Dalio')), 'Must include Ray Dalio masterclass');
    assert.ok(providers.some(p => p.includes('Cboe')), 'Must include Cboe / Options Playbook');
  });

  it('2. Feature Guides: covers every core feature of TradeSphere AI with how-to and metrics', () => {
    const requiredRoutes = [
      '/app/paper-trading',
      '/app/risk',
      '/app/risk/depth',
      '/app/risk/options',
      '/app/risk/greeks',
      '/app/risk/payoff',
      '/app/risk/journal',
      '/app/wealth/optimizer',
      '/app/wealth/frontier',
      '/app/wealth/scenarios',
      '/app/wealth/sip-planner',
      '/app/quant/multi-agent'
    ];

    const guideRoutes = PLATFORM_FEATURE_GUIDES.map(g => g.route);
    for (const r of requiredRoutes) {
      assert.ok(guideRoutes.includes(r), `Missing feature guide for route: ${r}`);
    }

    for (const g of PLATFORM_FEATURE_GUIDES) {
      assert.ok(g.howToUse.length >= 3, `Feature ${g.name} must have at least 3 how-to steps`);
      assert.ok(g.keyMetrics.length >= 2, `Feature ${g.name} must define at least 2 key metrics`);
      assert.ok(g.troubleshootingTip.length > 10, `Feature ${g.name} must have a troubleshooting tip`);
      assert.ok(g.videoGuideUrl.startsWith('http'), `Feature ${g.name} must link to a valid video/educational URL`);
    }
  });

  it('3. Platform FAQs: answers key questions on Rule A, circuit breaker, OCO, and IV crush', () => {
    assert.ok(PLATFORM_FAQS.length >= 8, `Expected at least 8 FAQs, found ${PLATFORM_FAQS.length}`);

    const allQText = PLATFORM_FAQS.map(f => f.question.toLowerCase() + ' ' + f.answer.toLowerCase()).join(' ');
    assert.ok(allQText.includes('rule a') || allQText.includes('0 shares') || allQText.includes('safe sizing'), 'FAQ must explain Rule A zero-sizing');
    assert.ok(allQText.includes('circuit breaker') || allQText.includes('drawdown'), 'FAQ must explain daily circuit breaker');
    assert.ok(allQText.includes('bracket') || allQText.includes('oco'), 'FAQ must explain bracket OCO orders');
    assert.ok(allQText.includes('implied volatility') || allQText.includes('iv crush'), 'FAQ must explain IV and options pricing');
  });

  it('4. Academy Quizzes: questions have valid correctIndex, at least 4 options, and non-empty explanations', () => {
    assert.ok(ACADEMY_QUIZ_QUESTIONS.length >= 10, `Expected at least 10 quiz questions, found ${ACADEMY_QUIZ_QUESTIONS.length}`);

    for (const q of ACADEMY_QUIZ_QUESTIONS) {
      assert.ok(q.options.length >= 4, `Question ${q.id} must have at least 4 options`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Question ${q.id} correctIndex out of bounds`);
      assert.ok(q.explanation.length > 20, `Question ${q.id} must have a detailed explanation`);
      assert.ok(q.relatedFeatureRoute.startsWith('/app/'), `Question ${q.id} must link to a platform feature route`);
    }
  });

  it('5. Practical Exercises: contains scenarios, hints, verified solutions, and active routes', () => {
    assert.ok(PRACTICAL_EXERCISES.length >= 4, `Expected at least 4 practical exercises, found ${PRACTICAL_EXERCISES.length}`);

    for (const ex of PRACTICAL_EXERCISES) {
      assert.ok(ex.scenario.length > 30, `Exercise ${ex.id} must have a realistic market scenario`);
      assert.ok(ex.task.length > 15, `Exercise ${ex.id} must define an objective task`);
      assert.ok(ex.hints.length >= 2, `Exercise ${ex.id} must provide at least 2 calculation hints`);
      assert.ok(ex.solution.length > 30, `Exercise ${ex.id} must provide a verified mathematical solution`);
      assert.ok(ex.featureRoute.startsWith('/app/'), `Exercise ${ex.id} must have a valid TradeSphere AI feature route`);
    }
  });
});
