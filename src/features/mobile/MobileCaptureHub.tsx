import React, { useState } from 'react';
import { generateTags } from '../../hooks/useReflectionTags';
import { useAppStore } from '../../store/useAppStore';
import type { Reflection, ReflectionQuestion, ReflectionTemplate } from '../../types';
import { formatLocalDateTime, getTodayString } from '../../utils/date';
import { useMobilePanelHistory } from './useMobilePanelHistory';

type CaptureMode = 'inspiration' | 'reflection';
type InspirationCaptureStep = 'content' | 'source' | 'tags' | 'review';
type ReflectionCaptureStep = string;
type CaptureStepDefinition<T extends string> = {
  id: T;
  label: string;
  questionIds?: string[];
};

type MobileCaptureHistoryItem = {
  id: string;
  kind: CaptureMode;
  destination: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: string;
};

const REVIEW_STEP_ID = 'review';

const modeLabels: Record<CaptureMode, string> = {
  inspiration: '灵感',
  reflection: '反思',
};

const modeDestinations: Record<CaptureMode, string> = {
  inspiration: '灵感库',
  reflection: '反思库',
};

const modeDescriptions: Record<CaptureMode, string> = {
  inspiration: '先把想法收进来，稍后再决定是否转成任务。',
  reflection: '按每日反思模板补充障碍、方法、有效/无效和明天调整。',
};

const inspirationStepDefinitions: CaptureStepDefinition<InspirationCaptureStep>[] = [
  { id: 'content', label: '想法' },
  { id: 'source', label: '来源' },
  { id: 'tags', label: '标签' },
  { id: 'review', label: '确认' },
];

const reflectionPlaceholders: Record<string, string> = {
  'q-obstacle': '今天最大的障碍是什么？',
  'q-solution': '你准备怎么处理它？',
  'q-effective': '哪些做法有效，哪些无效？',
  'q-adjustment': '明天先调整哪一件事？',
};

const reflectionQuestionFallbackLabels: Record<string, string> = {
  'q-obstacle': '最大障碍',
  'q-solution': '解决方法',
  'q-effective': '有效/无效',
  'q-adjustment': '明天调整',
  'q-control': '掌控感',
};

const controlLevelOptions = Array.from({ length: 10 }, (_, index) => index + 1);

const createReflectionAnswers = (
  template: ReflectionTemplate | undefined,
  existingReflection: Reflection | undefined
) => {
  if (existingReflection) {
    return { ...existingReflection.answers };
  }

  const initial: Record<string, string | number> = {};
  template?.questions.forEach((question) => {
    initial[question.id] = question.type === 'number' ? question.min ?? 1 : '';
  });
  return initial;
};

const getReflectionPreview = (
  reflection: Reflection,
  template: ReflectionTemplate | undefined
) => {
  const firstFilledTextQuestion = template?.questions.find((question) => {
    if (question.type !== 'text') return false;
    return String(reflection.answers[question.id] ?? '').trim().length > 0;
  });

  return firstFilledTextQuestion
    ? String(reflection.answers[firstFilledTextQuestion.id])
    : '已保存反思';
};

const parseCaptureTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const mobileSystemTags = new Set(['mobile', 'inspiration', 'reflection']);

const getInitialReflectionStep = (template: ReflectionTemplate | undefined, hasSavedReflection: boolean) => {
  if (hasSavedReflection) return REVIEW_STEP_ID;
  return template?.questions[0]?.id ?? REVIEW_STEP_ID;
};

const MobileCaptureHub: React.FC = () => {
  const today = getTodayString();
  const [mode, setMode] = useState<CaptureMode>('inspiration');
  const [content, setContent] = useState('');
  const [sourceInput, setSourceInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [savedFlash, setSavedFlash] = useState('');
  const [latestSavedId, setLatestSavedId] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [inspirationCaptureStep, setInspirationCaptureStep] = useState<InspirationCaptureStep>('content');
  const [reflectionCaptureStep, setReflectionCaptureStep] = useState<ReflectionCaptureStep>('q-obstacle');
  const addInspiration = useAppStore((s) => s.addInspiration);
  const inspirations = useAppStore((s) => s.inspirations);
  const saveReflection = useAppStore((s) => s.saveReflection);
  const reflections = useAppStore((s) => s.reflections);
  const reflectionTemplates = useAppStore((s) => s.reflectionTemplates);
  const getDefaultTemplate = useAppStore((s) => s.getDefaultTemplate);
  const defaultTemplate = getDefaultTemplate();
  const todayReflection = reflections.find((reflection) => (reflection.kind ?? 'daily') === 'daily' && reflection.date === today);
  const reflectionTemplate = reflectionTemplates.find((template) => template.id === (todayReflection?.templateId ?? defaultTemplate?.id)) ?? defaultTemplate;
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string | number>>(() =>
    createReflectionAnswers(reflectionTemplate, todayReflection)
  );

  const reflectionStepDefinitions: CaptureStepDefinition<ReflectionCaptureStep>[] = [
    ...(reflectionTemplate?.questions.map((question) => ({
      id: question.id,
      label: reflectionQuestionFallbackLabels[question.id] ?? question.label,
      questionIds: [question.id],
    })) ?? []),
    { id: REVIEW_STEP_ID, label: '确认', questionIds: [] },
  ];
  const firstReflectionStep = reflectionStepDefinitions[0]?.id ?? REVIEW_STEP_ID;
  const activeReflectionStep = reflectionStepDefinitions.some((step) => step.id === reflectionCaptureStep)
    ? reflectionCaptureStep
    : firstReflectionStep;

  const mobileInspirationCaptures: MobileCaptureHistoryItem[] = inspirations
    .filter((item) => item.tags.includes('mobile'))
    .map((item) => ({
      id: item.id,
      kind: 'inspiration',
      destination: '灵感库',
      content: item.content,
      source: item.source,
      tags: item.tags,
      createdAt: item.createdAt,
    }));

  const mobileReflectionCaptures: MobileCaptureHistoryItem[] = reflections
    .filter((reflection) => (reflection.kind ?? 'daily') === 'daily' && reflection.tags.includes('mobile'))
    .map((reflection) => {
      const { updatedAt, createdAt } = reflection;
      const template = reflectionTemplates.find((item) => item.id === reflection.templateId);
      return {
        id: `reflection-${reflection.date}`,
        kind: 'reflection',
        destination: '反思库',
        content: getReflectionPreview(reflection, template),
        tags: reflection.tags,
        createdAt: updatedAt ?? createdAt,
      };
    });

  const recentInspirations = mobileInspirationCaptures
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const recentReflections = mobileReflectionCaptures
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const controlQuestion = reflectionTemplate?.questions.find((question) => question.id === 'q-control' || question.label.includes('掌控'));
  const controlDisplay = todayReflection && controlQuestion && todayReflection.answers[controlQuestion.id]
    ? `${todayReflection.answers[controlQuestion.id]}/10`
    : undefined;
  const canSaveCapture = content.trim().length > 0;
  const requiredReflectionFields = reflectionTemplate?.questions.filter((question) => question.required) ?? [];
  const canSaveReflection =
    Boolean(reflectionTemplate) &&
    requiredReflectionFields.every((question) => String(reflectionAnswers[question.id] ?? '').trim().length > 0);
  const isQuickComposerOpen = isComposerOpen && mode === 'inspiration';
  const isStructuredComposerOpen = isComposerOpen && mode === 'reflection';
  const hasUnsavedInspirationDraft =
    content.trim().length > 0 || sourceInput.trim().length > 0 || tagInput.trim().length > 0;
  const reflectionDraftBaseline = createReflectionAnswers(reflectionTemplate, todayReflection);
  const hasReflectionAnswerChanges = Object.entries(reflectionAnswers).some(([questionId, value]) => {
    const currentValue = String(value ?? '').trim();
    const baselineValue = String(reflectionDraftBaseline[questionId] ?? '').trim();
    return currentValue !== baselineValue;
  });
  const hasUnsavedReflectionDraft = isStructuredComposerOpen && hasReflectionAnswerChanges;

  const openComposer = (nextMode: CaptureMode) => {
    setMode(nextMode);
    if (nextMode === 'inspiration') {
      setInspirationCaptureStep('content');
    }
    if (nextMode === 'reflection') {
      setReflectionAnswers(createReflectionAnswers(reflectionTemplate, todayReflection));
      setReflectionCaptureStep(getInitialReflectionStep(reflectionTemplate, Boolean(todayReflection)));
      setIsEditingReflection(!todayReflection);
    }
    setIsComposerOpen(true);
  };

  const requestCloseComposer = () => {
    const hasDraft = isQuickComposerOpen
      ? hasUnsavedInspirationDraft
      : hasUnsavedReflectionDraft;
    if (hasDraft && !window.confirm('当前内容还没保存，确认收起吗？')) {
      return;
    }
    setIsComposerOpen(false);
    setIsEditingReflection(false);
    setInspirationCaptureStep('content');
    setReflectionCaptureStep(firstReflectionStep);
  };

  useMobilePanelHistory(isComposerOpen, requestCloseComposer, 'capture-composer');

  const toggleComposer = (nextMode: CaptureMode) => {
    if (isComposerOpen && mode === nextMode) {
      requestCloseComposer();
      return;
    }
    openComposer(nextMode);
  };

  const selectCaptureMode = (nextMode: CaptureMode) => {
    if (mode === nextMode) return;
    const hasDraft = isQuickComposerOpen
      ? hasUnsavedInspirationDraft
      : hasUnsavedReflectionDraft;
    if (isComposerOpen && hasDraft && !window.confirm('当前内容还没保存，确认切换吗？')) {
      return;
    }
    setMode(nextMode);
    setIsComposerOpen(false);
    setIsEditingReflection(false);
    setInspirationCaptureStep('content');
    setReflectionCaptureStep(getInitialReflectionStep(reflectionTemplate, nextMode === 'reflection' && Boolean(todayReflection)));
  };

  const closeComposerAfterSave = (savedId: string, label: string) => {
    setIsComposerOpen(false);
    setIsEditingReflection(false);
    setInspirationCaptureStep('content');
    setReflectionCaptureStep(firstReflectionStep);
    setLatestSavedId(savedId);
    setSavedFlash(`${label}已保存到${modeDestinations[mode]}`);
    window.setTimeout(() => {
      setSavedFlash('');
      setLatestSavedId('');
    }, 2200);
  };

  const saveReflectionCapture = () => {
    const template = reflectionTemplate;
    if (!template || !canSaveReflection) return;

    saveReflection({
      date: today,
      kind: 'daily',
      templateId: template.id,
      answers: reflectionAnswers,
      tags: Array.from(new Set([...generateTags(template, reflectionAnswers), 'mobile', 'reflection'])),
    });

    closeComposerAfterSave(`reflection-${today}`, '反思');
  };

  const saveCapture = () => {
    if (mode === 'inspiration') {
      const nextContent = content.trim();
      if (!nextContent) return;

      const captureTags = Array.from(new Set(['mobile', mode, ...parseCaptureTags(tagInput)]));
      const savedId = addInspiration({
        content: nextContent,
        source: sourceInput.trim() || undefined,
        tags: captureTags,
      });

      setContent('');
      setSourceInput('');
      setTagInput('');
      closeComposerAfterSave(savedId, modeLabels.inspiration);
      return;
    }

    saveReflectionCapture();
  };

  const getInspirationStepSummary = (step: InspirationCaptureStep) => {
    if (step === 'content') return content.trim() || '写下核心想法';
    if (step === 'source') return sourceInput.trim() || '来源可以跳过';
    if (step === 'tags') return parseCaptureTags(tagInput).join('、') || '标签可以跳过';
    return canSaveCapture ? '检查后保存到灵感库' : '先完成想法';
  };

  const getReflectionStepSummary = (step: ReflectionCaptureStep) => {
    if (step === REVIEW_STEP_ID) {
      if (todayReflection && !isEditingReflection) return '已保存，可查看/编辑';
      return canSaveReflection ? '检查后保存到反思库' : '先补齐必填项';
    }

    const question = reflectionTemplate?.questions.find((item) => item.id === step);
    if (!question) return '继续补充';
    const answer = String(reflectionAnswers[question.id] ?? '').trim();
    if (answer) return answer;
    return question.required ? `补齐${reflectionQuestionFallbackLabels[question.id] ?? question.label}` : `${reflectionQuestionFallbackLabels[question.id] ?? question.label}可以跳过`;
  };

  const getNextReflectionStep = (step: ReflectionCaptureStep) => {
    const currentIndex = reflectionStepDefinitions.findIndex((item) => item.id === step);
    return reflectionStepDefinitions[Math.min(currentIndex + 1, reflectionStepDefinitions.length - 1)]?.id ?? REVIEW_STEP_ID;
  };

  const getPreviousReflectionStep = (step: ReflectionCaptureStep) => {
    const currentIndex = reflectionStepDefinitions.findIndex((item) => item.id === step);
    return reflectionStepDefinitions[Math.max(currentIndex - 1, 0)]?.id ?? firstReflectionStep;
  };

  const renderCaptureStepper = <T extends string>(
    steps: CaptureStepDefinition<T>[],
    activeStep: T,
    getSummary: (step: T) => string,
    onStepSelect: (step: T) => void
  ) => {
    const activeIndex = steps.findIndex((step) => step.id === activeStep);

    return (
      <div className="mobile-capture-stepper" aria-label={`${modeLabels[mode]}记录流程链`}>
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isComplete = index < activeIndex;
          const isPending = index > activeIndex;
          return (
            <button
              type="button"
              key={step.id}
              className={`mobile-capture-node${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}${isPending ? ' is-pending' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`切换到${step.label}步骤`}
              onClick={() => onStepSelect(step.id)}
            >
              <span className="mobile-capture-node-index">{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.label}</strong>
              <small className="mobile-capture-node-summary">{getSummary(step.id)}</small>
            </button>
          );
        })}
      </div>
    );
  };

  const renderHistoryItem = (item: MobileCaptureHistoryItem) => {
    const visibleTags = item.tags.filter((tag) => !mobileSystemTags.has(tag));
    return (
      <article
        className={`mobile-capture-history-item${item.id === latestSavedId ? ' is-new' : ''}`}
        key={item.id}
      >
        <div className="mobile-capture-history-meta">
          <span>{modeLabels[item.kind]} · {item.destination}</span>
          <time dateTime={item.createdAt}>
            {formatLocalDateTime(item.createdAt)}
          </time>
        </div>
        <p>{item.content}</p>
        {(item.source || visibleTags.length > 0) && (
          <div className="mobile-capture-history-extra">
            {item.source && <span className="mobile-capture-history-source">来源：{item.source}</span>}
            {visibleTags.length > 0 && (
              <div className="mobile-capture-history-tags">
                {visibleTags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    );
  };

  const renderRecentList = (
    className: string,
    title: string,
    items: MobileCaptureHistoryItem[],
    emptyText: string
  ) => (
    <section className="mobile-capture-history-section">
      <div className={`mobile-capture-history ${className}`} aria-label={title}>
        <div className="mobile-section-heading">
          <div>
            <h2>{title}</h2>
          </div>
          <span>{items.length}</span>
        </div>
        {items.length === 0 ? (
          <div className="mobile-empty-state">{emptyText}</div>
        ) : (
          items.map(renderHistoryItem)
        )}
      </div>
    </section>
  );

  const renderInspirationWorkflow = () => {
    const previewTags = parseCaptureTags(tagInput);

    return (
      <div className="mobile-capture-workflow">
        {renderCaptureStepper(
          inspirationStepDefinitions,
          inspirationCaptureStep,
          getInspirationStepSummary,
          setInspirationCaptureStep
        )}
        {inspirationCaptureStep === 'content' && (
          <div className="mobile-capture-step">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="写一条灵感..."
              className="mobile-textarea mobile-capture-textarea"
              rows={5}
              enterKeyHint="next"
            />
            <button
              type="button"
              className="mobile-primary-button mobile-capture-save"
              disabled={!canSaveCapture}
              onClick={() => setInspirationCaptureStep('source')}
            >
              下一步：来源
            </button>
          </div>
        )}
        {inspirationCaptureStep === 'source' && (
          <div className="mobile-capture-step">
            <div className="mobile-capture-optional-fields">
              <label className="mobile-capture-field">
                <span>来源（可选）</span>
                <small className="mobile-capture-field-help">
                  来源可以不填；补上书、文章、对话或现场，之后回看会更清楚。
                </small>
                <input
                  value={sourceInput}
                  onChange={(event) => setSourceInput(event.target.value)}
                  placeholder="书/文章/对话..."
                  inputMode="text"
                  enterKeyHint="next"
                />
              </label>
            </div>
            <div className="mobile-capture-step-actions">
              <button
                type="button"
                className="mobile-capture-secondary-button"
                onClick={() => setInspirationCaptureStep('content')}
              >
                上一步
              </button>
              <button
                type="button"
                className="mobile-capture-secondary-button"
                onClick={() => setInspirationCaptureStep('tags')}
              >
                跳过来源
              </button>
              <button
                type="button"
                className="mobile-primary-button is-primary"
                onClick={() => setInspirationCaptureStep('tags')}
              >
                下一步：标签
              </button>
            </div>
          </div>
        )}
        {inspirationCaptureStep === 'tags' && (
          <div className="mobile-capture-step">
            <div className="mobile-capture-optional-fields">
              <label className="mobile-capture-field">
                <span>标签（用逗号分隔）</span>
                <small className="mobile-capture-field-help">
                  标签可以不填；先写 1 到 3 个关键词，方便之后筛选。
                </small>
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="设计, 写作, 产品..."
                  inputMode="text"
                  enterKeyHint="done"
                />
              </label>
            </div>
            <div className="mobile-capture-step-actions">
              <button
                type="button"
                className="mobile-capture-secondary-button"
                onClick={() => setInspirationCaptureStep('source')}
              >
                上一步
              </button>
              <button
                type="button"
                className="mobile-capture-secondary-button"
                onClick={() => setInspirationCaptureStep('review')}
              >
                跳过标签
              </button>
              <button
                type="button"
                className="mobile-primary-button is-primary"
                onClick={() => setInspirationCaptureStep('review')}
              >
                下一步：确认
              </button>
            </div>
          </div>
        )}
        {inspirationCaptureStep === 'review' && (
          <div className="mobile-capture-step">
            <div className="mobile-capture-review">
              <div>
                <span>想法</span>
                <p>{content.trim() || '未填写'}</p>
              </div>
              <div>
                <span>来源</span>
                <p>{sourceInput.trim() || '未填写'}</p>
              </div>
              <div>
                <span>标签</span>
                {previewTags.length > 0 ? (
                  <div className="mobile-capture-review-tags">
                    {previewTags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p>未填写</p>
                )}
              </div>
            </div>
            <div className="mobile-capture-step-actions">
              <button
                type="button"
                className="mobile-capture-secondary-button"
                onClick={() => setInspirationCaptureStep('tags')}
              >
                上一步
              </button>
              <button
                type="button"
                className="mobile-primary-button is-primary mobile-capture-save"
                disabled={!canSaveCapture}
                onClick={saveCapture}
              >
                保存到灵感库
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const openReflectionEditor = () => {
    setReflectionAnswers(createReflectionAnswers(reflectionTemplate, todayReflection));
    setReflectionCaptureStep(firstReflectionStep);
    setIsEditingReflection(true);
  };

  const updateReflectionAnswer = (question: ReflectionQuestion, value: string | number) => {
    setReflectionAnswers((previous) => ({ ...previous, [question.id]: value }));
  };

  const renderReflectionField = (question: ReflectionQuestion) => {
    const isControlQuestion = question.id === 'q-control' || question.label.includes('掌控');
    const min = question.min ?? 1;
    const max = question.max ?? 10;
    const numberOptions = isControlQuestion
      ? controlLevelOptions
      : Array.from({ length: max - min + 1 }, (_, index) => min + index);

    return (
      <label
        key={question.id}
        className={`mobile-reflection-field${question.type === 'number' ? ' mobile-reflection-number-field' : ''}`}
      >
        <span>
          {reflectionQuestionFallbackLabels[question.id] ?? question.label}
          {question.required ? ' *' : ''}
        </span>
        {question.type === 'text' && (
          <textarea
            value={String(reflectionAnswers[question.id] ?? '')}
            onChange={(event) => updateReflectionAnswer(question, event.target.value)}
            placeholder={reflectionPlaceholders[question.id] ?? '...'}
            className="mobile-textarea"
            rows={question.id === 'q-obstacle' ? 3 : 2}
          />
        )}
        {question.type === 'number' && (
          <>
            <select
              value={String(reflectionAnswers[question.id] ?? question.min ?? 1)}
              onChange={(event) => updateReflectionAnswer(question, Number(event.target.value))}
            >
              {numberOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isControlQuestion && (
              <small className="mobile-reflection-field-help">
                1 代表失控，5 代表基本可控，10 代表高度掌控。
              </small>
            )}
          </>
        )}
        {question.type === 'select' && question.options && (
          <select
            value={String(reflectionAnswers[question.id] ?? '')}
            onChange={(event) => updateReflectionAnswer(question, event.target.value)}
          >
            <option value="">请选择</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </label>
    );
  };

  const renderReflectionReview = () => (
    <div className="mobile-capture-review">
      {reflectionTemplate?.questions.map((question) => {
        const value = String(reflectionAnswers[question.id] ?? '').trim();
        return (
          <div key={question.id}>
            <span>{reflectionQuestionFallbackLabels[question.id] ?? question.label}</span>
            <p>{value || (question.required ? '未填写' : '未填写，可跳过')}</p>
          </div>
        );
      })}
    </div>
  );

  const renderReflectionWorkflow = () => {
    const activeStep = activeReflectionStep;
    const activeQuestion = reflectionTemplate?.questions.find((question) => question.id === activeStep);
    const isReviewStep = activeStep === REVIEW_STEP_ID;
    const previousStep = getPreviousReflectionStep(activeStep);
    const nextStep = getNextReflectionStep(activeStep);

    return (
      <div className="mobile-capture-workflow mobile-structured-composer mobile-reflection-form">
        {renderCaptureStepper(
          reflectionStepDefinitions,
          activeStep,
          getReflectionStepSummary,
          setReflectionCaptureStep
        )}
        {!reflectionTemplate ? (
          <div className="mobile-empty-state">还没有可用的反思模板。</div>
        ) : isReviewStep ? (
          todayReflection && !isEditingReflection ? (
            <div className="mobile-reflection-saved-prompt">
              <strong>今日反思已保存</strong>
              <p>一天只保留一条每日反思。需要调整时，可以查看/编辑原反思。</p>
              {controlDisplay && <span>掌控感：{controlDisplay}</span>}
              <button type="button" onClick={openReflectionEditor}>
                查看/编辑反思
              </button>
            </div>
          ) : (
            <div className="mobile-capture-step">
              {renderReflectionReview()}
              <div className="mobile-capture-step-actions">
                {previousStep !== activeStep && (
                  <button
                    type="button"
                    className="mobile-capture-secondary-button"
                    onClick={() => setReflectionCaptureStep(previousStep)}
                  >
                    上一步
                  </button>
                )}
                <button
                  type="button"
                  className="mobile-primary-button is-primary mobile-capture-save"
                  disabled={!canSaveReflection}
                  onClick={saveCapture}
                >
                  保存到反思库
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="mobile-capture-step">
            {activeQuestion && renderReflectionField(activeQuestion)}
            <div className="mobile-capture-step-actions">
              {previousStep !== activeStep && (
                <button
                  type="button"
                  className="mobile-capture-secondary-button"
                  onClick={() => setReflectionCaptureStep(previousStep)}
                >
                  上一步
                </button>
              )}
              <button
                type="button"
                className="mobile-primary-button is-primary"
                onClick={() => setReflectionCaptureStep(nextStep)}
              >
                {nextStep === REVIEW_STEP_ID ? '下一步：确认' : `下一步：${reflectionStepDefinitions.find((step) => step.id === nextStep)?.label ?? '继续'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mobile-journal-timeline">
      <div className="mobile-capture-segmented" role="tablist" aria-label="记录类型">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'inspiration'}
          className={mode === 'inspiration' ? 'is-active' : ''}
          onClick={() => selectCaptureMode('inspiration')}
        >
          <strong>灵感</strong>
          <small>{recentInspirations.length}</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'reflection'}
          className={mode === 'reflection' ? 'is-active' : ''}
          onClick={() => selectCaptureMode('reflection')}
        >
          <strong>反思</strong>
          <small>{todayReflection ? '已写' : recentReflections.length}</small>
        </button>
      </div>

      <section className={`mobile-capture-composer ${isComposerOpen ? 'is-open' : 'is-collapsed'}`}>
        <div className="mobile-capture-body">
          <div className="mobile-card-label">{mode === 'inspiration' ? '快速捕捉' : '结构反思'}</div>
          <h1>{mode === 'inspiration' ? '灵感先收进来' : '反思和成效再整理'}</h1>
          <p>{modeDescriptions[mode]}</p>
          <div className="mobile-capture-mode-hint" aria-live="polite">
            <span>{modeDestinations[mode]}</span>
            <p>{mode === 'inspiration' ? '保存后只进入灵感库。' : '保存后更新今天的每日反思。'}</p>
          </div>
          <button
            type="button"
            className={`mobile-capture-trigger${isComposerOpen ? ' is-active' : ''}`}
            aria-label={mode === 'inspiration' ? '写一条灵感' : '写一条反思'}
            aria-expanded={isComposerOpen}
            onClick={() => toggleComposer(mode)}
          >
            {isComposerOpen ? `收起${modeLabels[mode]}` : `写一条${modeLabels[mode]}`}
          </button>
          {isComposerOpen && mode === 'inspiration' && renderInspirationWorkflow()}
          {isComposerOpen && mode === 'reflection' && renderReflectionWorkflow()}
          {savedFlash.startsWith(modeLabels[mode]) && <div className="mobile-save-flash">{savedFlash}</div>}
        </div>
      </section>

      {mode === 'inspiration'
        ? renderRecentList(
          'mobile-recent-inspirations',
          '最近灵感',
          recentInspirations,
          '保存灵感后会在这里看到最近灵感。'
        )
        : renderRecentList(
          'mobile-recent-reflections',
          '最近反思',
          recentReflections,
          '保存反思后会在这里看到最近反思。'
        )}
    </div>
  );
};

export default MobileCaptureHub;
