import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');
const readMobileRule = (css: string, selector: string) => {
  const mobileCss = css.slice(css.indexOf('@media (max-width: 767px)'));
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = mobileCss.match(new RegExp(`\\n\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  return match?.[1] ?? '';
};

test('App keeps desktop workspace and adds a mobile-only Forge entry point', () => {
  const app = read('src/App.tsx');

  assert.match(app, /import MobileAppShell from '\.\/features\/mobile\/MobileAppShell'/);
  assert.match(app, /className="app-frame desktop-app-frame"/);
  assert.match(app, /<MobileAppShell[\s\S]*onOpenModulePicker=\{\(\) => setModulePickerOpen\(true\)\}/);
});

test('mobile shell uses bottom navigation and routes to productized mobile sections', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /mobile-app-shell/);
  assert.match(shell, /mobile-bottom-nav/);
  assert.match(shell, /MobileTodayForge/);
  assert.match(shell, /MobileWeekProgress/);
  assert.match(shell, /MobileCaptureHub/);
  assert.doesNotMatch(shell, /mobile-topbar/);
  assert.doesNotMatch(shell, /mobile-brand/);
  assert.doesNotMatch(shell, /resources\.logoPixel/);
  assert.match(shell, /今日/);
  assert.match(shell, /推进/);
  assert.match(shell, /记录/);
  assert.match(shell, /系统/);
});

test('mobile shell mirrors tab changes into browser history for Android back navigation', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /MOBILE_SECTION_HASH_PREFIX/);
  assert.match(shell, /window\.history\.replaceState/);
  assert.match(shell, /window\.history\.pushState/);
  assert.match(shell, /window\.addEventListener\('popstate'/);
  assert.match(shell, /window\.removeEventListener\('popstate'/);
  assert.match(shell, /selectSection/);
  assert.match(shell, /setActiveSection\(nextSection\)/);
  assert.match(shell, /#mobile-/);
  assert.match(shell, /onClick=\{\(\) => selectSection\(item\.id\)\}/);
  assert.doesNotMatch(shell, /onClick=\{\(\) => setActiveSection\(item\.id\)\}/);
});

test('mobile today forge presents desktop data as a life-system entry, not a todo board', () => {
  const todayForge = read('src/features/mobile/MobileTodayForge.tsx');

  assert.match(todayForge, /mobile-today-focus-card/);
  assert.match(todayForge, /mobile-daily-command/);
  assert.match(todayForge, /mobile-status-pills/);
  assert.match(todayForge, /mobile-mainline-focus/);
  assert.match(todayForge, /mobile-command-principle/);
  assert.match(todayForge, /mobile-commitment-panel/);
  assert.match(todayForge, /mobile-commitment-row/);
  assert.doesNotMatch(todayForge, /mobile-quick-dock/);
  assert.match(todayForge, /今日锻造台/);
  assert.match(todayForge, /今日焦点/);
  assert.match(todayForge, /今日承诺/);
  assert.match(todayForge, /今日原则/);
  assert.doesNotMatch(todayForge, /快速记录/);
  assert.match(todayForge, /useAppStore/);
  assert.match(todayForge, /tasks[\s\S]*\.filter\(\(task\) => task\.date === today/);
  assert.match(todayForge, /principles/);
  assert.match(todayForge, /moods/);
  assert.match(todayForge, /saveMood/);
  assert.match(todayForge, /mobile-mood-panel/);
  assert.match(todayForge, /mobile-mood-controls/);
  assert.match(todayForge, /mobile-stepper-field/);
  assert.match(todayForge, /adjustMobileMood/);
  assert.match(todayForge, /adjustMobileEnergy/);
  assert.match(todayForge, /isMoodPanelOpen/);
  assert.match(todayForge, /setIsMoodPanelOpen\(false\)/);
  assert.match(todayForge, /mobile-mood-summary/);
  assert.match(todayForge, /aria-label="降低心境"/);
  assert.match(todayForge, /aria-label="提高能量"/);
  assert.match(todayForge, /aria-live="polite"/);
  assert.match(todayForge, /saveMood\(\{ date: today, mood: mobileMood, energy: mobileEnergy/);
  assert.doesNotMatch(todayForge, /type="range"/);
  assert.doesNotMatch(todayForge, /DndContext|SortableContext|useSortable/);
});

test('mobile today forge lets users add a task from a bottom sheet', () => {
  const todayForge = read('src/features/mobile/MobileTodayForge.tsx');

  assert.match(todayForge, /const addTask = useAppStore\(\(s\) => s\.addTask\)/);
  assert.match(todayForge, /isTaskComposerOpen/);
  assert.match(todayForge, /taskInput/);
  assert.match(todayForge, /mobile-commitment-title-row/);
  assert.match(todayForge, /mobile-commitment-add/);
  assert.match(todayForge, /aria-label="添加今日任务"/);
  assert.match(todayForge, /mobile-task-sheet/);
  assert.match(todayForge, /mobile-task-input/);
  assert.match(todayForge, /placeholder="写下今天要推进的一件事"/);
  assert.match(todayForge, /addTask\(trimmedTaskInput, today\)/);
  assert.match(todayForge, /disabled=\{trimmedTaskInput\.length === 0\}/);
  assert.match(todayForge, /updateMobileKeyboardInset/);
  assert.match(todayForge, /window\.visualViewport/);
  assert.match(todayForge, /--mobile-keyboard-inset/);
  assert.match(todayForge, /visualViewport\.addEventListener\('resize'/);
  assert.match(todayForge, /visualViewport\.removeEventListener\('resize'/);
  assert.doesNotMatch(todayForge, /mobile-task-fab/);
});

test('mobile progress uses a vertical system console instead of a horizontal task board', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(weekProgress, /mobile-progress-console/);
  assert.match(weekProgress, /mobile-week-console/);
  assert.match(weekProgress, /mobile-progress-stats/);
  assert.match(weekProgress, /mobile-day-timeline/);
  assert.match(weekProgress, /mobile-day-node/);
  assert.match(weekProgress, /mobile-day-status-chip/);
  assert.match(weekProgress, /mobile-week-review-panel/);
  assert.match(weekProgress, /WEEKLY_REVIEW_LITE_TEMPLATE_ID/);
  assert.match(weekProgress, /saveReflection/);
  assert.match(weekProgress, /aria-expanded=\{isWeeklyReviewOpen\}/);
  assert.match(weekProgress, /getTodayString/);
  assert.doesNotMatch(shell, /setPage\('weeklyReview'\)/);
  assert.doesNotMatch(weekProgress, /DndContext|SortableContext|useSortable/);
});

test('mobile progress keeps completed days collapsed but lets users open day details', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');

  assert.match(weekProgress, /collapsedDates/);
  assert.match(weekProgress, /expandedDates/);
  assert.match(weekProgress, /toggleDateExpansion/);
  assert.match(weekProgress, /const defaultExpanded = isToday \|\| active > 0/);
  assert.match(weekProgress, /const shouldExpand = !collapsedDates\.has\(date\) && \(defaultExpanded \|\| expandedDates\.has\(date\)\)/);
  assert.match(weekProgress, /toggleDateExpansion\(date, shouldExpand\)/);
  assert.match(weekProgress, /nextCollapsed\.add\(date\)/);
  assert.match(weekProgress, /nextCollapsed\.delete\(date\)/);
  assert.match(weekProgress, /aria-expanded=\{shouldExpand\}/);
  assert.match(weekProgress, /aria-controls=\{`mobile-day-detail-\$\{date\}`\}/);
  assert.match(weekProgress, /id=\{`mobile-day-detail-\$\{date\}`\}/);
  assert.match(weekProgress, /is-collapsed/);
  assert.match(weekProgress, /mobile-day-summary/);
  assert.match(weekProgress, /shouldExpand \?/);
  assert.doesNotMatch(weekProgress, /dayTasks\.slice\(0, 3\)/);
});

test('mobile progress supports week switching and historical weekly reviews', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');

  assert.match(weekProgress, /getPrevWeekStart/);
  assert.match(weekProgress, /getNextWeekStart/);
  assert.match(weekProgress, /selectedWeekStart/);
  assert.match(weekProgress, /setSelectedWeekStart/);
  assert.match(weekProgress, /periodStart === selectedWeekStart/);
  assert.match(weekProgress, /mobile-week-switcher/);
  assert.match(weekProgress, /上一周/);
  assert.match(weekProgress, /本周/);
  assert.match(weekProgress, /下一周/);
  assert.match(weekProgress, /aria-pressed=\{isCurrentWeek\}/);
  assert.match(weekProgress, /mobile-week-review-summary/);
  assert.match(weekProgress, /正在查看历史周/);
  assert.match(weekProgress, /已保存复盘/);
  assert.match(weekProgress, /未保存复盘/);
});

test('mobile progress can complete, edit, move, and delete task descriptions', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');

  assert.match(weekProgress, /const toggleTask = useAppStore\(\(s\) => s\.toggleTask\)/);
  assert.match(weekProgress, /const updateTask = useAppStore\(\(s\) => s\.updateTask\)/);
  assert.match(weekProgress, /const moveTask = useAppStore\(\(s\) => s\.moveTask\)/);
  assert.match(weekProgress, /const deleteTask = useAppStore\(\(s\) => s\.deleteTask\)/);
  assert.match(weekProgress, /mobile-day-task-toggle/);
  assert.match(weekProgress, /onClick=\{\(\) => toggleTask\(task\.id\)\}/);
  assert.match(weekProgress, /mobile-task-edit-input/);
  assert.match(weekProgress, /updateTask\(taskId, \{ content \}\)/);
  assert.match(weekProgress, /disabled=\{editingContent\.trim\(\)\.length === 0\}/);
  assert.match(weekProgress, /moveTask\(taskId, targetDate, order\)/);
  assert.match(weekProgress, /moveTaskToDate\(task\.id, tomorrow\)/);
  assert.match(weekProgress, /moveTaskToDate\(task\.id, 'BACKLOG'\)/);
  assert.match(weekProgress, /pendingDeleteTaskId/);
  assert.match(weekProgress, /is-danger-confirm/);
  assert.match(weekProgress, /deleteTask\(taskId\)/);
});

test('mobile progress includes a cross-week backlog inbox after the week', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');

  assert.match(weekProgress, /const addTask = useAppStore\(\(s\) => s\.addTask\)/);
  assert.match(weekProgress, /backlogTasks/);
  assert.match(weekProgress, /tasks\.filter\(\(task\) => task\.date === 'BACKLOG'\)/);
  assert.match(weekProgress, /mobile-backlog-inbox/);
  assert.match(weekProgress, /mobile-backlog-task-list/);
  assert.match(weekProgress, /mobile-backlog-composer/);
  assert.match(weekProgress, /addTask\(backlogInput\.trim\(\), 'BACKLOG'\)/);
  assert.match(weekProgress, /scheduleTaskId/);
  assert.match(weekProgress, /mobile-backlog-schedule-sheet/);
  assert.match(weekProgress, /weekDates\.map\(\(targetDate\)/);
  assert.match(weekProgress, /scheduleBacklogTask\(targetDate\)/);
  assert.match(weekProgress, /type="date"/);
  assert.match(weekProgress, /moveTask\(taskId, targetDate, order\)/);
  assert.match(weekProgress, /待安排任务/);
  assert.match(weekProgress, /安排/);
});

test('mobile task actions use compact controls without losing operations', () => {
  const weekProgress = read('src/features/mobile/MobileWeekProgress.tsx');
  const css = read('src/index.css');

  assert.match(weekProgress, /mobile-task-action-bar/);
  assert.match(weekProgress, /mobile-task-action-button/);
  assert.match(weekProgress, />\s*编辑\s*</);
  assert.match(weekProgress, />\s*明天\s*</);
  assert.match(weekProgress, />\s*收纳\s*</);
  assert.match(weekProgress, /\{isPendingDelete \? '确认删除' : '删除'\}/);
  assert.match(css, /\.mobile-task-action-button/);
  assert.match(css, /\.mobile-task-action-bar[\s\S]*grid-template-columns/);
  assert.match(css, /\.mobile-task-action-button[\s\S]*min-height:\s*36px/);
  assert.doesNotMatch(css, /\.mobile-task-action-bar button,[\s\S]*\.mobile-task-edit-actions button[\s\S]*min-height:\s*44px/);
});

test('mobile capture uses local time instead of raw ISO slicing', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');
  const dateUtils = read('src/utils/date.ts');

  assert.match(dateUtils, /export const formatLocalDateTime/);
  assert.match(dateUtils, /new Date\(value\)/);
  assert.match(dateUtils, /format\(date, 'M月d日 HH:mm'\)/);
  assert.match(captureHub, /import \{ formatLocalDateTime, getTodayString \} from '\.\.\/\.\.\/utils\/date'/);
  assert.match(captureHub, /\{formatLocalDateTime\(item\.createdAt\)\}/);
  assert.doesNotMatch(captureHub, /createdAt\.slice/);
  assert.doesNotMatch(captureHub, /replace\('T'/);
});

test('mobile capture separates quick inspiration from daily reflection deposits', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');

  assert.match(captureHub, /mobile-journal-timeline/);
  assert.match(captureHub, /mobile-capture-segmented/);
  assert.match(captureHub, /role="tablist"/);
  assert.match(captureHub, /aria-selected=\{mode === 'inspiration'\}/);
  assert.match(captureHub, /aria-selected=\{mode === 'reflection'\}/);
  assert.match(captureHub, /selectCaptureMode/);
  assert.match(captureHub, /mobile-capture-composer/);
  assert.doesNotMatch(captureHub, /mobile-capture-rail/);
  assert.match(captureHub, /mobile-capture-stepper/);
  assert.match(captureHub, /mobile-capture-save/);
  assert.match(captureHub, /mobile-structured-composer/);
  assert.match(captureHub, /isComposerOpen/);
  assert.match(captureHub, /setIsComposerOpen\(false\)/);
  assert.match(captureHub, /latestSavedId/);
  assert.match(captureHub, /setLatestSavedId\(savedId\)/);
  assert.match(captureHub, /mobile-capture-trigger/);
  assert.match(captureHub, /mobile-capture-mode-hint/);
  assert.match(captureHub, /is-open/);
  assert.match(captureHub, /is-collapsed/);
  assert.match(captureHub, /is-new/);
  assert.doesNotMatch(captureHub, /recentMobileCaptures/);
  assert.match(captureHub, /recentInspirations/);
  assert.match(captureHub, /recentReflections/);
  assert.match(captureHub, /mobile-recent-inspirations/);
  assert.match(captureHub, /mobile-recent-reflections/);
  assert.match(captureHub, /mobile-capture-history-item/);
  assert.match(captureHub, /captureTags/);
  assert.match(captureHub, /mode === 'inspiration'/);
  assert.match(captureHub, /saveReflection\(/);
  assert.doesNotMatch(captureHub, /type CaptureMode = 'inspiration' \| 'reflection' \| 'evidence'/);
  assert.doesNotMatch(captureHub, /const structuredModes/);
  assert.match(captureHub, /快速捕捉/);
  assert.match(captureHub, /灵感先收进来/);
  assert.match(captureHub, /反思和成效再整理/);
  assert.match(captureHub, /写一条反思/);
  assert.doesNotMatch(captureHub, /aria-pressed=\{mode === item && isStructuredComposerOpen\}/);
  assert.doesNotMatch(captureHub, /questionId = mode === 'evidence' \? 'q-effective' : 'q-solution'/);
  assert.doesNotMatch(captureHub, /保存到记录流/);
  assert.match(captureHub, /保存到灵感库/);
  assert.doesNotMatch(captureHub, /mobile-capture-lanes/);
  assert.doesNotMatch(captureHub, /mobile-capture-deposit/);
  assert.doesNotMatch(captureHub, /mobile-capture-deposit-actions/);
  assert.doesNotMatch(captureHub, />证据</);
  assert.doesNotMatch(captureHub, />成效</);
  assert.doesNotMatch(captureHub, /低摩擦保存，不要求现在就整理成反思/);
});

test('mobile capture keeps desktop source and tag fields for record stream items', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');

  assert.match(captureHub, /type InspirationCaptureStep = 'content' \| 'source' \| 'tags' \| 'review'/);
  assert.match(captureHub, /inspirationCaptureStep/);
  assert.match(captureHub, /setInspirationCaptureStep\('content'\)/);
  assert.match(captureHub, /setInspirationCaptureStep\('source'\)/);
  assert.match(captureHub, /setInspirationCaptureStep\('tags'\)/);
  assert.match(captureHub, /setInspirationCaptureStep\('review'\)/);
  assert.match(captureHub, /mobile-capture-stepper/);
  assert.match(captureHub, /mobile-capture-node/);
  assert.match(captureHub, /mobile-capture-node-summary/);
  assert.match(captureHub, /is-complete/);
  assert.match(captureHub, /is-pending/);
  assert.match(captureHub, /mobile-capture-stepper/);
  assert.match(captureHub, /mobile-capture-step/);
  assert.match(captureHub, /mobile-capture-step-actions/);
  assert.match(captureHub, /mobile-capture-review/);
  assert.match(captureHub, /下一步：来源/);
  assert.match(captureHub, /跳过来源/);
  assert.match(captureHub, /下一步：标签/);
  assert.match(captureHub, /跳过标签/);
  assert.match(captureHub, /下一步：确认/);
  assert.match(captureHub, /来源可以不填/);
  assert.match(captureHub, /标签可以不填/);
  assert.match(captureHub, /sourceInput/);
  assert.match(captureHub, /tagInput/);
  assert.match(captureHub, /parseCaptureTags/);
  assert.match(captureHub, /split\(\/\[,，\]\//);
  assert.match(captureHub, /mobile-capture-optional-fields/);
  assert.match(captureHub, /mobile-capture-field/);
  assert.match(captureHub, /来源（可选）/);
  assert.match(captureHub, /placeholder="书\/文章\/对话\.\.\."/);
  assert.match(captureHub, /标签（用逗号分隔）/);
  assert.match(captureHub, /placeholder="设计, 写作, 产品\.\.\."/);
  assert.match(captureHub, /source:\s*sourceInput\.trim\(\) \|\| undefined/);
  assert.match(captureHub, /tags:\s*captureTags/);
  assert.match(captureHub, /setSourceInput\(''\)/);
  assert.match(captureHub, /setTagInput\(''\)/);
  assert.match(captureHub, /item\.source/);
  assert.match(captureHub, /mobile-capture-history-source/);
  assert.match(captureHub, /mobile-capture-history-tags/);
});

test('mobile capture uses matching vertical process chains with separate semantics', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');
  const css = read('src/index.css');

  assert.match(captureHub, /type ReflectionCaptureStep = string/);
  assert.match(captureHub, /reflectionCaptureStep/);
  assert.match(captureHub, /reflectionStepDefinitions/);
  assert.match(captureHub, /renderCaptureStepper/);
  assert.match(captureHub, /aria-label=\{`\$\{modeLabels\[mode\]\}记录流程链`\}/);
  assert.doesNotMatch(captureHub, /mobile-capture-node-rail/);
  assert.match(captureHub, /mobile-capture-stepper/);
  assert.match(captureHub, /想法/);
  assert.match(captureHub, /来源/);
  assert.match(captureHub, /标签/);
  assert.match(captureHub, /确认/);
  assert.match(captureHub, /最大障碍/);
  assert.match(captureHub, /解决方法/);
  assert.match(captureHub, /有效\/无效/);
  assert.match(captureHub, /最近灵感/);
  assert.match(captureHub, /最近反思/);
  assert.match(captureHub, /保存到灵感库/);
  assert.match(captureHub, /保存到反思库/);
  assert.match(css, /\.mobile-capture-stepper[\s\S]*position:\s*relative/);
  assert.doesNotMatch(css, /\.mobile-capture-node-rail/);
  assert.match(css, /\.mobile-capture-node-index[\s\S]*border-radius:\s*50%/);
});

test('mobile capture composers can collapse without switching modules', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');

  assert.match(captureHub, /toggleComposer/);
  assert.match(captureHub, /requestCloseComposer/);
  assert.match(captureHub, /hasUnsavedInspirationDraft/);
  assert.match(captureHub, /hasUnsavedReflectionDraft/);
  assert.match(captureHub, /reflectionDraftBaseline/);
  assert.match(captureHub, /hasReflectionAnswerChanges/);
  assert.match(captureHub, /createReflectionAnswers\(reflectionTemplate, todayReflection\)/);
  assert.match(captureHub, /hasUnsavedReflectionDraft =\s*isStructuredComposerOpen && hasReflectionAnswerChanges/);
  assert.match(captureHub, /confirm\(/);
  assert.match(captureHub, /setIsComposerOpen\(false\)/);
  assert.match(captureHub, /isComposerOpen \? `收起\$\{modeLabels\[mode\]\}` : `写一条\$\{modeLabels\[mode\]\}`/);
});

test('mobile reflection capture follows the desktop daily reflection template without polluting inspiration vault', () => {
  const captureHub = read('src/features/mobile/MobileCaptureHub.tsx');

  assert.match(captureHub, /mobile-reflection-form/);
  assert.match(captureHub, /mobile-reflection-field/);
  assert.match(captureHub, /mobile-reflection-number-field/);
  assert.match(captureHub, /mobile-reflection-saved-prompt/);
  assert.match(captureHub, /isEditingReflection/);
  assert.match(captureHub, /openReflectionEditor/);
  assert.match(captureHub, /setIsEditingReflection\(!todayReflection\)/);
  assert.match(captureHub, /今日反思已保存/);
  assert.match(captureHub, /查看\/编辑反思/);
  assert.match(captureHub, /最大障碍/);
  assert.match(captureHub, /解决方法/);
  assert.match(captureHub, /有效\/无效/);
  assert.match(captureHub, /明天调整/);
  assert.match(captureHub, /掌控感/);
  assert.match(captureHub, /controlLevelOptions/);
  assert.match(captureHub, /mobile-reflection-field-help/);
  assert.match(captureHub, /1 代表失控/);
  assert.match(captureHub, /10 代表高度掌控/);
  assert.match(captureHub, /requiredReflectionFields/);
  assert.match(captureHub, /canSaveReflection/);
  assert.match(captureHub, /reflectionAnswers/);
  assert.match(captureHub, /setReflectionAnswers/);
  assert.match(captureHub, /generateTags/);
  assert.match(captureHub, /tags:\s*Array\.from\(new Set\(\[\.\.\.generateTags\(template, reflectionAnswers\), 'mobile', 'reflection'\]\)\)/);
  assert.match(captureHub, /mobileReflectionCaptures/);
  assert.match(captureHub, /updatedAt \?\? createdAt/);
  assert.match(captureHub, /destination:\s*'反思库'/);
  assert.match(captureHub, /kind:\s*'reflection'/);
  assert.doesNotMatch(captureHub, /if \(mode !== 'inspiration'\)/);
  assert.doesNotMatch(captureHub, /type="number"/);
});

test('mobile system section is compact status rows, not another stacked card', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /mobile-system-panel/);
  assert.match(shell, /mobile-system-status/);
  assert.match(shell, /mobile-system-row/);
  assert.doesNotMatch(shell, /mobile-card mobile-system-card/);
});

test('dossier visual style reaches the mobile shell without changing mobile navigation', () => {
  const app = read('src/App.tsx');
  const mobileShellBlock = app.match(/\.dossier-style-shell \.mobile-app-shell\s*\{[\s\S]*?\n\s*\}/)?.[0] ?? '';

  assert.match(app, /\.dossier-style-shell \.mobile-app-shell/);
  assert.doesNotMatch(mobileShellBlock, /#2b2118/);
  assert.match(app, /\.dossier-style-shell \.mobile-bottom-nav/);
  assert.match(app, /\.dossier-style-shell \.mobile-nav-button/);
  assert.match(app, /\.dossier-style-shell \.mobile-system-row/);
  assert.match(app, /\.dossier-style-shell \.mobile-daily-command/);
  assert.match(app, /\.dossier-style-shell \.mobile-mood-summary\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(app, /\.dossier-style-shell \.mobile-capture-composer/);
  assert.match(app, /\.dossier-style-shell \.mobile-week-console/);
  assert.match(app, /visualStyleLabel={effectiveMobileVisualStyleLabel}/);
});

test('claude visual style reaches the mobile shell without changing mobile navigation', () => {
  const app = read('src/App.tsx');
  const mobileShellBlock = app.match(/\.claude-style-shell \.mobile-app-shell\s*\{[\s\S]*?\n\s*\}/)?.[0] ?? '';

  assert.match(app, /\.claude-style-shell \.mobile-app-shell/);
  assert.doesNotMatch(mobileShellBlock, /grid-template-columns|position:\s*fixed|display:\s*grid/);
  assert.match(app, /\.claude-style-shell \.mobile-bottom-nav/);
  assert.match(app, /\.claude-style-shell \.mobile-nav-button/);
  assert.match(app, /\.claude-style-shell \.mobile-system-row/);
  assert.match(app, /\.claude-style-shell \.mobile-daily-command/);
  assert.match(app, /\.claude-style-shell \.mobile-capture-composer/);
  assert.match(app, /\.claude-style-shell \.mobile-week-console/);
  assert.doesNotMatch(app, /\.orbit-style-shell \.mobile-app-shell/);
});

test('mobile visual style can be local-only without changing desktop style', () => {
  const app = read('src/App.tsx');
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(app, /MOBILE_VISUAL_STYLE_LOCAL_KEY/);
  assert.match(app, /MOBILE_VISUAL_STYLE_KEY/);
  assert.match(app, /import \{ platformStorage \} from '\.\/utils\/platformStorage'/);
  assert.match(app, /readMobilePreferenceState/);
  assert.match(app, /writeMobilePreferenceState/);
  assert.match(app, /normalizeVisualStyle/);
  assert.match(app, /value === 'orbit' \? 'claude'/);
  assert.match(app, /platformStorage\.getItem\(key\)/);
  assert.match(app, /platformStorage\.setItem\(key, \{ state: value \}\)/);
  assert.doesNotMatch(app, /window\.localStorage/);
  assert.match(app, /isMobileVisualStyleLocal/);
  assert.match(app, /mobileVisualStyle/);
  assert.match(app, /toggleMobileVisualStyle/);
  assert.match(app, /toggleMobileVisualStyleLocal/);
  assert.match(app, /effectiveMobileVisualStyle/);
  assert.match(app, /onToggleVisualStyle={toggleMobileVisualStyle}/);
  assert.match(app, /onToggleMobileVisualStyleLocal={toggleMobileVisualStyleLocal}/);
  assert.match(app, /isMobileVisualStyleLocal={isMobileVisualStyleLocal}/);
  assert.match(app, /mobile-style-scope/);
  assert.match(app, /mobileStyleScopeClassName/);
  assert.match(shell, /isMobileVisualStyleLocal/);
  assert.match(shell, /onToggleMobileVisualStyleLocal/);
  assert.match(shell, /本机独立风格/);
  assert.match(shell, /跟随桌面/);
});

test('mobile system opens real sync tools instead of routing to hidden desktop chrome', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /import SyncPanel from '\.\.\/system\/SyncPanel'/);
  assert.match(shell, /isSystemToolsOpen/);
  assert.match(shell, /aria-expanded=\{isSystemToolsOpen\}/);
  assert.match(shell, /mobile-system-tools/);
  assert.match(shell, /<SyncPanel \/>/);
  assert.doesNotMatch(shell, /onClick=\{\(\) => setPage\('system'\)\}/);
});

test('mobile CSS treats Android safe areas and hides desktop board chrome on phones', () => {
  const css = read('src/index.css');
  const mobileShell = readMobileRule(css, '.mobile-app-shell');
  const mobileContent = readMobileRule(css, '.mobile-content');
  const bottomNav = readMobileRule(css, '.mobile-bottom-nav');

  assert.match(css, /\.mobile-app-shell[\s\S]*display:\s*none/);
  assert.match(css, /@media \(max-width: 767px\), \(hover: none\) and \(pointer: coarse\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.desktop-app-frame[\s\S]*display:\s*none/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-app-shell[\s\S]*display:\s*flex/);
  assert.match(mobileShell, /height:\s*100dvh/);
  assert.match(mobileShell, /padding-top:\s*0/);
  assert.doesNotMatch(mobileShell, /safe-area-inset-top/);
  assert.doesNotMatch(css, /mobile-topbar|mobile-brand|--mobile-topbar-height/);
  assert.match(mobileContent, /padding:\s*12px 12px 0/);
  assert.match(mobileContent, /padding-bottom:\s*calc\(env\(safe-area-inset-bottom\) \+ 16px\)/);
  assert.match(mobileContent, /overflow-y:\s*auto/);
  assert.match(mobileContent, /scrollbar-width:\s*none/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-content::-webkit-scrollbar[\s\S]*display:\s*none/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-daily-command[\s\S]*border:\s*0/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-commitment-row[\s\S]*min-height:\s*48px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-commitment-add[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-day-timeline[\s\S]*border-left/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-composer[\s\S]*min-height:\s*0/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-composer\.is-open[\s\S]*min-height:\s*260px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-trigger[\s\S]*min-height:\s*52px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-mode-hint[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-stepper[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-node[\s\S]*grid-template-columns:\s*34px minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-step[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-step-actions[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-review[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-optional-fields[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-field input[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-segmented[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-segmented button[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-structured-composer[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-week-review-panel[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-week-switcher[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-week-switcher button[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-action-bar[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-action-button[\s\S]*min-height:\s*36px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-edit-actions button[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-edit-input[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-history[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-history-item\.is-new[\s\S]*animation:\s*mobile-capture-new/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-capture-history-tags[\s\S]*display:\s*flex/);
  assert.match(css, /@keyframes mobile-capture-new/);
  assert.doesNotMatch(css, /mobile-capture-lanes/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-mood-panel[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-mood-summary[\s\S]*min-height:\s*42px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-mood-controls[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-stepper-control button[\s\S]*min-height:\s*44px/);
  assert.doesNotMatch(css, /\.mobile-task-fab/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-sheet[\s\S]*position:\s*fixed/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*--mobile-keyboard-inset:\s*0px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-sheet[\s\S]*bottom:\s*calc\(env\(safe-area-inset-bottom\) \+ var\(--mobile-keyboard-inset\) \+ 82px\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-task-input[\s\S]*min-height:\s*52px/);
  assert.match(bottomNav, /position:\s*relative/);
  assert.match(bottomNav, /left:\s*auto/);
  assert.match(bottomNav, /right:\s*auto/);
  assert.match(bottomNav, /bottom:\s*auto/);
  assert.doesNotMatch(bottomNav, /position:\s*fixed/);
  assert.match(bottomNav, /padding-bottom:\s*calc\(env\(safe-area-inset-bottom\)[\s\S]*\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-nav-button[\s\S]*min-height:\s*52px/);
});

test('mobile CSS prevents dense titles and uses a restrained radius system', () => {
  const css = read('src/index.css');

  assert.match(css, /@media \(max-width: 767px\)[\s\S]*--mobile-radius:\s*18px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-mainline-focus h1[\s\S]*-webkit-line-clamp:\s*2/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-commitment-row[\s\S]*border-radius:\s*14px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-day-node[\s\S]*border-radius:\s*var\(--mobile-radius\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-nav-button\s*\{[\s\S]*border-radius:\s*14px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-nav-button\[aria-current="page"\][\s\S]*border-radius:\s*999px/);
});
