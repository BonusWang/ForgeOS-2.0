import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { WEEKLY_REVIEW_LITE_TEMPLATE_ID } from '../../store/slices/reflectionTemplateSlice';
import {
  getDateLabelForDay,
  getDayColumnFromDate,
  getNextWeekStart,
  getPrevWeekStart,
  getTodayString,
  getWeekDates,
  getWeekStart,
} from '../../utils/date';
import type { InboxItem, Reflection, Task } from '../../types';
import { useMobilePanelHistory } from './useMobilePanelHistory';

const getTextAnswer = (review: Reflection | undefined, ids: string[]) => {
  if (!review) return '';
  const answer = ids.map((id) => review.answers[id]).find((value) => typeof value === 'string' && value.trim());
  return answer ? String(answer) : '';
};

const getTaskPreview = (value: string) => value.trim() || '未填写';

const MobileWeekProgress: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const reflections = useAppStore((s) => s.reflections);
  const saveReflection = useAppStore((s) => s.saveReflection);
  const addTask = useAppStore((s) => s.addTask);
  const addInspiration = useAppStore((s) => s.addInspiration);
  const inboxItems = useAppStore((s) => s.inboxItems);
  const removeFromInbox = useAppStore((s) => s.removeFromInbox);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const moveTask = useAppStore((s) => s.moveTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const today = getTodayString();
  const currentWeekStart = getWeekStart();
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
  const weekDates = getWeekDates(selectedWeekStart);
  const periodEnd = weekDates[6];
  const weekTasks = tasks.filter((task) => weekDates.includes(task.date));
  const backlogTasks = tasks.filter((task) => task.date === 'BACKLOG').sort((a, b) => a.order - b.order);
  const completedCount = weekTasks.filter((task) => task.status === 'completed').length;
  const activeCount = weekTasks.length - completedCount;
  const completedWeekTasks = weekTasks.filter((task) => task.status === 'completed');
  const mobileWeekEvidence = {
    completed: completedWeekTasks.length,
    active: activeCount,
    abilityPoints: completedWeekTasks.reduce((sum, task) => sum + (task.abilityPoints ?? 0), 0),
    relatedReflections: reflections.filter(
      (reflection) => (reflection.kind ?? 'daily') === 'daily' && weekDates.includes(reflection.date)
    ).length,
  };
  const completionRatio = weekTasks.length === 0 ? 0 : Math.round((completedCount / weekTasks.length) * 100);
  const existingReview = reflections.find(
    (reflection) => reflection.kind === 'weeklyReview' && reflection.periodStart === selectedWeekStart
  );
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [done, setDone] = useState(() => getTextAnswer(existingReview, ['weekly-done', 'weekly-facts']));
  const [blocked, setBlocked] = useState(() => getTextAnswer(existingReview, ['weekly-blocked', 'weekly-questions']));
  const [nextOne, setNextOne] = useState(() => getTextAnswer(existingReview, ['weekly-next-one', 'weekly-next']));
  const [savedFlash, setSavedFlash] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(() => new Set());
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(() => new Set());
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState('');
  const [backlogInput, setBacklogInput] = useState('');
  const [scheduleTaskId, setScheduleTaskId] = useState('');
  const [customScheduleDate, setCustomScheduleDate] = useState('');
  const canSaveReview = done.trim().length > 0 && nextOne.trim().length > 0;
  const isCurrentWeek = selectedWeekStart === currentWeekStart;
  const reviewDone = getTextAnswer(existingReview, ['weekly-done', 'weekly-facts']);
  const reviewNext = getTextAnswer(existingReview, ['weekly-next-one', 'weekly-next']);

  useMobilePanelHistory(isWeeklyReviewOpen, () => setIsWeeklyReviewOpen(false), 'weekly-review-panel');
  useMobilePanelHistory(Boolean(scheduleTaskId), () => setScheduleTaskId(''), 'backlog-schedule-panel');

  const resetWeekDraft = (weekStart: string) => {
    const nextReview = reflections.find(
      (reflection) => reflection.kind === 'weeklyReview' && reflection.periodStart === weekStart
    );
    setDone(getTextAnswer(nextReview, ['weekly-done', 'weekly-facts']));
    setBlocked(getTextAnswer(nextReview, ['weekly-blocked', 'weekly-questions']));
    setNextOne(getTextAnswer(nextReview, ['weekly-next-one', 'weekly-next']));
    setEditingTaskId('');
    setEditingContent('');
    setPendingDeleteTaskId('');
    setScheduleTaskId('');
    setCustomScheduleDate('');
    setExpandedDates(new Set());
    setCollapsedDates(new Set());
  };

  const selectWeek = (weekStart: string) => {
    setSelectedWeekStart(weekStart);
    resetWeekDraft(weekStart);
  };

  const toggleDateExpansion = (date: string, isExpanded: boolean) => {
    setExpandedDates((current) => {
      const next = new Set(current);
      if (isExpanded) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
    setCollapsedDates((current) => {
      const nextCollapsed = new Set(current);
      if (isExpanded) {
        nextCollapsed.add(date);
      } else {
        nextCollapsed.delete(date);
      }
      return nextCollapsed;
    });
  };

  const saveWeeklyReview = () => {
    if (!canSaveReview) return;

    saveReflection({
      date: periodEnd,
      kind: 'weeklyReview',
      periodStart: selectedWeekStart,
      periodEnd,
      templateId: WEEKLY_REVIEW_LITE_TEMPLATE_ID,
      answers: {
        'weekly-done': done.trim(),
        'weekly-blocked': blocked.trim(),
        'weekly-next-one': nextOne.trim(),
      },
      tags: ['周复盘', `${selectedWeekStart}~${periodEnd}`, selectedWeekStart.slice(0, 7), 'mobile'],
    });
    setSavedFlash('周复盘已保存');
    window.setTimeout(() => setSavedFlash(''), 1800);
  };

  const startTaskEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingContent(task.content);
    setPendingDeleteTaskId('');
  };

  const saveTaskEdit = (taskId: string) => {
    const content = editingContent.trim();
    if (!content) return;
    updateTask(taskId, { content });
    setEditingTaskId('');
    setEditingContent('');
  };

  const moveTaskToDate = (taskId: string, targetDate: string) => {
    const order = tasks.filter((task) => task.date === targetDate).length;
    moveTask(taskId, targetDate, order);
    setPendingDeleteTaskId('');
    setScheduleTaskId('');
    setCustomScheduleDate('');
  };

  const clarifyInboxAsToday = (item: InboxItem) => {
    addTask(item.content, today, item.abilityId, item.abilityPoints);
    removeFromInbox(item.id);
  };

  const clarifyInboxAsBacklog = (item: InboxItem) => {
    addTask(item.content, 'BACKLOG', item.abilityId, item.abilityPoints);
    removeFromInbox(item.id);
  };

  const clarifyInboxAsInspiration = (item: InboxItem) => {
    addInspiration({
      content: item.content,
      source: item.objectiveTitle ?? item.abilityName ?? '移动端待澄清',
      tags: ['mobile', 'clarified'],
    });
    removeFromInbox(item.id);
  };

  const addBacklogTask = () => {
    const content = backlogInput.trim();
    if (!content) return;
    addTask(backlogInput.trim(), 'BACKLOG');
    setBacklogInput('');
  };

  const scheduleBacklogTask = (targetDate: string) => {
    if (!scheduleTaskId || !targetDate) return;
    moveTaskToDate(scheduleTaskId, targetDate);
  };

  const deleteTaskWithConfirmation = (taskId: string) => {
    if (pendingDeleteTaskId !== taskId) {
      setPendingDeleteTaskId(taskId);
      setEditingTaskId('');
      return;
    }
    deleteTask(taskId);
    setPendingDeleteTaskId('');
  };

  const renderTaskRow = (task: Task) => {
    const isEditing = editingTaskId === task.id;
    const isPendingDelete = pendingDeleteTaskId === task.id;
    const tomorrow = format(addDays(new Date(task.date), 1), 'yyyy-MM-dd');

    return (
      <article className={`mobile-day-task${task.status === 'completed' ? ' is-completed' : ''}`} key={task.id}>
        <button
          type="button"
          className="mobile-day-task-toggle"
          aria-label={`${task.status === 'completed' ? '取消完成' : '完成'} ${task.content}`}
          onClick={() => toggleTask(task.id)}
        >
          {task.status === 'completed' ? '☑' : '□'}
        </button>
        <div className="mobile-day-task-body">
          {isEditing ? (
            <div className="mobile-task-edit-panel">
              <input
                className="mobile-task-edit-input"
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                aria-label="编辑任务描述"
              />
              <div className="mobile-task-edit-actions">
                <button type="button" onClick={() => saveTaskEdit(task.id)} disabled={editingContent.trim().length === 0}>
                  保存
                </button>
                <button type="button" onClick={() => setEditingTaskId('')}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p>{task.content}</p>
          )}
          <div className="mobile-task-action-bar" aria-label={`${task.content} 操作`}>
            <button type="button" className="mobile-task-action-button" onClick={() => startTaskEdit(task)}>
              编辑
            </button>
            <button type="button" className="mobile-task-action-button" onClick={() => moveTaskToDate(task.id, tomorrow)}>
              明天
            </button>
            <button type="button" className="mobile-task-action-button" onClick={() => moveTaskToDate(task.id, 'BACKLOG')}>
              收纳
            </button>
            <button
              type="button"
              className={`mobile-task-action-button${isPendingDelete ? ' is-danger-confirm' : ''}`}
              onClick={() => deleteTaskWithConfirmation(task.id)}
            >
              {isPendingDelete ? '确认删除' : '删除'}
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderBacklogTaskRow = (task: Task) => {
    const isEditing = editingTaskId === task.id;
    const isPendingDelete = pendingDeleteTaskId === task.id;

    return (
      <article className="mobile-day-task mobile-backlog-task" key={task.id}>
        <div className="mobile-backlog-task-marker" aria-hidden="true">收</div>
        <div className="mobile-day-task-body">
          {isEditing ? (
            <div className="mobile-task-edit-panel">
              <input
                className="mobile-task-edit-input"
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                aria-label="编辑待安排任务描述"
              />
              <div className="mobile-task-edit-actions">
                <button type="button" onClick={() => saveTaskEdit(task.id)} disabled={editingContent.trim().length === 0}>
                  保存
                </button>
                <button type="button" onClick={() => setEditingTaskId('')}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p>{task.content}</p>
          )}
          <div className="mobile-task-action-bar" aria-label={`${task.content} 待安排操作`}>
            <button type="button" className="mobile-task-action-button" onClick={() => setScheduleTaskId(task.id)}>
              安排
            </button>
            <button type="button" className="mobile-task-action-button" onClick={() => startTaskEdit(task)}>
              编辑
            </button>
            <button
              type="button"
              className={`mobile-task-action-button${isPendingDelete ? ' is-danger-confirm' : ''}`}
              onClick={() => deleteTaskWithConfirmation(task.id)}
            >
              {isPendingDelete ? '确认删除' : '删除'}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mobile-progress-console">
      <section className="mobile-week-console">
        <div className="mobile-card-label">本周推进</div>
        <h1>{format(new Date(selectedWeekStart), 'M月d日')} - {format(new Date(periodEnd), 'M月d日')}</h1>
        <p>{isCurrentWeek ? '移动端先完成轻量复盘，桌面端保留更完整的整理视图。' : '正在查看历史周，可检查任务完成和已保存复盘。'}</p>
        <div className="mobile-week-switcher" aria-label="切换周">
          <button type="button" onClick={() => selectWeek(getPrevWeekStart(selectedWeekStart))}>
            上一周
          </button>
          <button type="button" aria-pressed={isCurrentWeek} onClick={() => selectWeek(currentWeekStart)}>
            本周
          </button>
          <button type="button" onClick={() => selectWeek(getNextWeekStart(selectedWeekStart))}>
            下一周
          </button>
        </div>
        <div className="mobile-progress-stats" aria-label="本周状态">
          <span><strong>{completedCount}</strong>已完成</span>
          <span><strong>{activeCount}</strong>待推进</span>
          <span><strong>{completionRatio}%</strong>完成率</span>
        </div>
        <div className="mobile-week-evidence" aria-label="本周证据">
          <span><strong>{mobileWeekEvidence.completed}</strong>完成任务</span>
          <span><strong>{mobileWeekEvidence.active}</strong>未完成任务</span>
          <span><strong>+{mobileWeekEvidence.abilityPoints}</strong>能力加分</span>
          <span><strong>{mobileWeekEvidence.relatedReflections}</strong>相关反思</span>
        </div>
        <div className="mobile-week-review-summary" aria-label="周复盘摘要">
          <span>{existingReview ? '已保存复盘' : '未保存复盘'}</span>
          <p>完成：{getTaskPreview(reviewDone)}</p>
          <p>下周调整：{getTaskPreview(reviewNext)}</p>
        </div>
        <button
          type="button"
          className="mobile-primary-button"
          aria-controls="mobile-week-review-panel"
          aria-expanded={isWeeklyReviewOpen}
          onClick={() => setIsWeeklyReviewOpen((open) => !open)}
        >
          {isWeeklyReviewOpen ? '收起周复盘' : existingReview ? '查看/编辑周复盘' : '打开周复盘'}
        </button>
      </section>

      {isWeeklyReviewOpen && (
        <section
          id="mobile-week-review-panel"
          className="mobile-week-review-panel"
          aria-label="移动端周复盘"
        >
          <div className="mobile-section-heading">
            <div>
              <span>周复盘</span>
              <h2>{selectedWeekStart} - {periodEnd}</h2>
            </div>
            <span>{existingReview ? '已保存' : '草稿'}</span>
          </div>

          <label className="mobile-review-field">
            <span>本周完成了什么 *</span>
            <textarea
              value={done}
              onChange={(event) => setDone(event.target.value)}
              className="mobile-textarea"
              rows={4}
            />
          </label>

          <label className="mobile-review-field">
            <span>本周卡在哪里</span>
            <textarea
              value={blocked}
              onChange={(event) => setBlocked(event.target.value)}
              className="mobile-textarea"
              rows={3}
            />
          </label>

          <label className="mobile-review-field">
            <span>下周只调整一件什么事 *</span>
            <textarea
              value={nextOne}
              onChange={(event) => setNextOne(event.target.value)}
              className="mobile-textarea"
              rows={4}
            />
          </label>

          <button
            type="button"
            className="mobile-primary-button"
            disabled={!canSaveReview}
            onClick={saveWeeklyReview}
          >
            保存周复盘
          </button>
          {savedFlash && <div className="mobile-save-flash">{savedFlash}</div>}
        </section>
      )}

      <div className="mobile-day-timeline" aria-label="本周每日推进">
        {weekDates.map((date) => {
          const dayTasks = tasks
            .filter((task) => task.date === date)
            .sort((a, b) => a.order - b.order);
          const dayColumn = getDayColumnFromDate(new Date(date));
          const complete = dayTasks.filter((task) => task.status === 'completed').length;
          const active = dayTasks.length - complete;
          const isToday = date === today;
          const dayLabel = getDateLabelForDay(dayColumn);
          const dayStatus = dayTasks.length === 0
            ? '空白'
            : active === 0
              ? '已完成'
              : isToday
                ? '今日推进'
                : '待处理';
          const defaultExpanded = isToday || active > 0;
          const shouldExpand = !collapsedDates.has(date) && (defaultExpanded || expandedDates.has(date));
          const summary = dayTasks.length === 0
            ? '这一天还没有承诺。'
            : `已完成 ${complete} 项，点开查看明细。`;

          return (
            <section
              className={`mobile-day-node${isToday ? ' is-today' : ''}${!shouldExpand ? ' is-collapsed' : ''}`}
              key={date}
            >
              <span className="mobile-day-marker" aria-hidden="true" />
              <button
                type="button"
                className="mobile-day-header mobile-day-toggle"
                aria-controls={`mobile-day-detail-${date}`}
                aria-expanded={shouldExpand}
                aria-label={`${dayLabel} ${date} ${shouldExpand ? '收起任务明细' : '查看任务明细'}`}
                onClick={() => toggleDateExpansion(date, shouldExpand)}
              >
                <div>
                  <span>{dayLabel}</span>
                  <strong>{format(new Date(date), 'MM/dd')}</strong>
                </div>
                <span className="mobile-day-status-chip">{dayStatus} · {complete}/{dayTasks.length}</span>
              </button>
              {shouldExpand ? (
                <div id={`mobile-day-detail-${date}`} className="mobile-day-task-list">
                  {dayTasks.map(renderTaskRow)}
                  {dayTasks.length === 0 && <div className="mobile-empty-state">这一天还没有承诺。</div>}
                </div>
              ) : (
                <div className="mobile-day-summary">{summary}</div>
              )}
            </section>
          );
        })}
      </div>

      <section className="mobile-inbox-clarifier" aria-label="移动端待澄清">
        <div className="mobile-section-heading">
          <div>
            <span>轻量澄清</span>
            <h2>待澄清</h2>
          </div>
          <span>{inboxItems.length}</span>
        </div>
        <p className="mobile-backlog-copy">手机端只处理最轻的归类：今天、待安排任务、灵感或删除。</p>
        <div className="mobile-inbox-clarifier-list">
          {inboxItems.length === 0 ? (
            <div className="mobile-empty-state">暂无待澄清事项。</div>
          ) : (
            inboxItems.map((item) => (
              <article className="mobile-inbox-clarifier-item" key={item.id}>
                <div>
                  <p>{item.content}</p>
                  <span>{item.objectiveTitle ?? item.abilityName ?? '待澄清'}</span>
                </div>
                <div className="mobile-task-action-bar" aria-label={`${item.content} 澄清操作`}>
                  <button
                    type="button"
                    className="mobile-task-action-button"
                    aria-label={`澄清为今日任务 ${item.content}`}
                    onClick={() => clarifyInboxAsToday(item)}
                  >
                    今日任务
                  </button>
                  <button
                    type="button"
                    className="mobile-task-action-button"
                    aria-label={`转为待安排任务 ${item.content}`}
                    onClick={() => clarifyInboxAsBacklog(item)}
                  >
                    转为待安排任务
                  </button>
                  <button
                    type="button"
                    className="mobile-task-action-button"
                    aria-label={`澄清为灵感 ${item.content}`}
                    onClick={() => clarifyInboxAsInspiration(item)}
                  >
                    灵感
                  </button>
                  <button
                    type="button"
                    className="mobile-task-action-button"
                    aria-label={`删除待澄清事项 ${item.content}`}
                    onClick={() => removeFromInbox(item.id)}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mobile-backlog-inbox" aria-label="跨周待安排任务">
        <div className="mobile-section-heading">
          <div>
            <span>跨周公共池</span>
            <h2>待安排任务</h2>
          </div>
          <span>{backlogTasks.length}</span>
        </div>
        <p className="mobile-backlog-copy">不确定日期的任务先放这里，想清楚后再安排到具体一天。</p>
        <div className="mobile-backlog-composer">
          <input
            value={backlogInput}
            onChange={(event) => setBacklogInput(event.target.value)}
            placeholder="新增一个待安排任务"
            aria-label="新增待安排任务"
          />
          <button type="button" onClick={addBacklogTask} disabled={backlogInput.trim().length === 0}>
            新增
          </button>
        </div>
        <div className="mobile-backlog-task-list">
          {backlogTasks.length === 0 ? (
            <div className="mobile-empty-state">转为待安排任务后会在这里统一处理。</div>
          ) : (
            backlogTasks.map(renderBacklogTaskRow)
          )}
        </div>
      </section>

      {scheduleTaskId && (
        <div className="mobile-backlog-schedule-sheet" role="dialog" aria-label="安排待安排任务">
          <div className="mobile-section-heading">
            <div>
              <span>安排到日期</span>
              <h2>选择本周某一天</h2>
            </div>
            <button type="button" onClick={() => setScheduleTaskId('')}>
              关闭
            </button>
          </div>
          <div className="mobile-backlog-week-grid">
            {weekDates.map((targetDate) => (
              <button key={targetDate} type="button" onClick={() => scheduleBacklogTask(targetDate)}>
                <span>{getDateLabelForDay(getDayColumnFromDate(new Date(targetDate)))}</span>
                <strong>{format(new Date(targetDate), 'MM/dd')}</strong>
              </button>
            ))}
          </div>
          <label className="mobile-backlog-custom-date">
            <span>选择其他日期</span>
            <input
              type="date"
              value={customScheduleDate}
              onChange={(event) => setCustomScheduleDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="mobile-primary-button"
            disabled={!customScheduleDate}
            onClick={() => scheduleBacklogTask(customScheduleDate)}
          >
            安排到其他日期
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileWeekProgress;
