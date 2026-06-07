import React, { useEffect, useRef, useState } from 'react';
import { addDays, format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { getTodayString } from '../../utils/date';
import { useMobilePanelHistory } from './useMobilePanelHistory';

const clampMoodScore = (value: number) => Math.min(10, Math.max(1, value));

const mobileDailyRhythm = [
  { label: '早上', text: '看今日焦点，选出最多三件承诺。' },
  { label: '白天', text: '推进当前承诺，临时想法先收集。' },
  { label: '晚上', text: '补一条反思，把今天的证据留下。' },
];

const MobileTodayForge: React.FC = () => {
  const today = getTodayString();
  const tomorrow = format(addDays(new Date(today), 1), 'yyyy-MM-dd');
  const tasks = useAppStore((s) => s.tasks);
  const principles = useAppStore((s) => s.principles);
  const moods = useAppStore((s) => s.moods);
  const reflections = useAppStore((s) => s.reflections);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const moveTask = useAppStore((s) => s.moveTask);
  const saveMood = useAppStore((s) => s.saveMood);

  const todayTasks = tasks
    .filter((task) => task.date === today)
    .sort((a, b) => a.order - b.order);
  const activeCommitments = todayTasks.filter((task) => task.status === 'active');
  const completedCount = todayTasks.length - activeCommitments.length;
  const todayMood = moods.find((mood) => mood.date === today);
  const [mobileMood, setMobileMood] = useState(() => todayMood?.mood ?? 5);
  const [mobileEnergy, setMobileEnergy] = useState(() => todayMood?.energy ?? 5);
  const [isMoodPanelOpen, setIsMoodPanelOpen] = useState(() => !todayMood);
  const [moodFlash, setMoodFlash] = useState('');
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);
  const todayReflection = reflections.find((reflection) => (reflection.kind ?? 'daily') === 'daily' && reflection.date === today);
  const todayPrinciple = [...principles].sort((a, b) => a.order - b.order)[0];
  const reflectionObstacle = todayReflection?.answers['q-obstacle'];
  const mainLine = activeCommitments[0]?.content ?? (reflectionObstacle ? String(reflectionObstacle) : '先定今天的主线');
  const completionRatio = todayTasks.length === 0 ? 0 : Math.round((completedCount / todayTasks.length) * 100);
  const trimmedTaskInput = taskInput.trim();

  useEffect(() => {
    if (!isTaskComposerOpen) return;
    const focusTimer = window.setTimeout(() => taskInputRef.current?.focus(), 80);
    return () => window.clearTimeout(focusTimer);
  }, [isTaskComposerOpen]);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    const shell = document.querySelector<HTMLElement>('.mobile-app-shell');
    if (!isTaskComposerOpen || !visualViewport || !shell) return;

    const updateMobileKeyboardInset = () => {
      const keyboardInset = Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop);
      shell.style.setProperty('--mobile-keyboard-inset', `${Math.round(keyboardInset)}px`);
    };

    updateMobileKeyboardInset();
    visualViewport.addEventListener('resize', updateMobileKeyboardInset);
    visualViewport.addEventListener('scroll', updateMobileKeyboardInset);

    return () => {
      visualViewport.removeEventListener('resize', updateMobileKeyboardInset);
      visualViewport.removeEventListener('scroll', updateMobileKeyboardInset);
      shell.style.setProperty('--mobile-keyboard-inset', '0px');
    };
  }, [isTaskComposerOpen]);

  const adjustMobileMood = (amount: number) => {
    setMobileMood((value) => clampMoodScore(value + amount));
  };

  const adjustMobileEnergy = (amount: number) => {
    setMobileEnergy((value) => clampMoodScore(value + amount));
  };

  const saveMobileMood = () => {
    saveMood({ date: today, mood: mobileMood, energy: mobileEnergy, note: todayMood?.note ?? '' });
    setIsMoodPanelOpen(false);
    setMoodFlash('状态已保存');
    window.setTimeout(() => setMoodFlash(''), 1800);
  };

  const closeTaskComposer = () => {
    setTaskInput('');
    setIsTaskComposerOpen(false);
  };

  useMobilePanelHistory(isTaskComposerOpen, closeTaskComposer, 'today-task-composer');

  const addTodayTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedTaskInput.length === 0) return;
    addTask(trimmedTaskInput, today);
    closeTaskComposer();
  };

  return (
    <div className="mobile-today-forge">
      <section className="mobile-daily-command mobile-today-focus-card" aria-labelledby="mobile-today-title">
        <div className="mobile-command-topline">
          <span>{format(new Date(today), 'yyyy年M月d日')}</span>
          <strong>今日锻造台</strong>
        </div>
        <div className="mobile-mainline-focus">
          <span>今日焦点</span>
          <h1 id="mobile-today-title">{mainLine}</h1>
        </div>
        <div className="mobile-status-pills" aria-label="今日状态">
          <span>{todayMood?.mood ? `心境 ${todayMood.mood}/10` : '心境未记'}</span>
          <span>{todayMood?.energy ? `能量 ${todayMood.energy}/10` : '能量未记'}</span>
          <span>{todayTasks.length === 0 ? '未设承诺' : `完成 ${completedCount}/${todayTasks.length}`}</span>
        </div>
        {isMoodPanelOpen ? (
          <div className="mobile-mood-panel" aria-label="填写心境与能量">
            <div className="mobile-mood-panel-head">
              <span>今日状态</span>
              <strong>{todayMood ? '调整中' : '待记录'}</strong>
            </div>
            <div className="mobile-mood-controls">
              <div className="mobile-stepper-field">
                <span>心境</span>
                <div className="mobile-stepper-control">
                  <button
                    type="button"
                    aria-label="降低心境"
                    disabled={mobileMood <= 1}
                    onClick={() => adjustMobileMood(-1)}
                  >
                    -
                  </button>
                  <strong>{mobileMood}<small>/10</small></strong>
                  <button
                    type="button"
                    aria-label="提高心境"
                    disabled={mobileMood >= 10}
                    onClick={() => adjustMobileMood(1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mobile-stepper-field">
                <span>能量</span>
                <div className="mobile-stepper-control">
                  <button
                    type="button"
                    aria-label="降低能量"
                    disabled={mobileEnergy <= 1}
                    onClick={() => adjustMobileEnergy(-1)}
                  >
                    -
                  </button>
                  <strong>{mobileEnergy}<small>/10</small></strong>
                  <button
                    type="button"
                    aria-label="提高能量"
                    disabled={mobileEnergy >= 10}
                    onClick={() => adjustMobileEnergy(1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button type="button" className="mobile-mood-save" onClick={saveMobileMood}>
              {todayMood ? '更新并收起' : '保存状态'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="mobile-mood-summary"
            onClick={() => setIsMoodPanelOpen(true)}
          >
            <span>{todayMood ? '今日状态已记录' : '补记今日状态'}</span>
            <strong>
              {todayMood
                ? `心境 ${todayMood.mood}/10 · 能量 ${todayMood.energy}/10`
                : '填写心境与能量'}
            </strong>
          </button>
        )}
        {moodFlash && (
          <span className="mobile-inline-flash" aria-live="polite" role="status">
            {moodFlash}
          </span>
        )}
        <div className="mobile-progress-track" aria-hidden="true">
          <span style={{ width: `${completionRatio}%` }} />
        </div>
        <p className="mobile-command-principle">
          今日原则：{todayPrinciple?.content ?? '先完成再完美'}
        </p>
      </section>

      <section className="mobile-rhythm-panel" aria-label="移动端使用节奏">
        {mobileDailyRhythm.map((item) => (
          <div key={item.label} className="mobile-rhythm-row">
            <span>{item.label}</span>
            <strong>{item.text}</strong>
          </div>
        ))}
      </section>

      <section className="mobile-commitment-panel" aria-label="今日承诺">
        <div className="mobile-commitment-title-row">
          <div className="mobile-section-heading">
            <div>
              <div className="mobile-card-label">今日承诺</div>
              <h2>最多盯住三件事</h2>
            </div>
            <span>{activeCommitments.length}</span>
          </div>
          <button
            type="button"
            className="mobile-commitment-add"
            aria-label="添加今日任务"
            aria-controls="mobile-task-sheet"
            aria-expanded={isTaskComposerOpen}
            onClick={() => setIsTaskComposerOpen(true)}
          >
            +
          </button>
        </div>
        <div className="mobile-commitment-list">
          {activeCommitments.slice(0, 3).map((task) => (
            <article className="mobile-commitment-row" key={task.id}>
              <button
                type="button"
                className="mobile-check-button"
                onClick={() => toggleTask(task.id)}
                aria-label={`完成 ${task.content}`}
              >
                □
              </button>
              <div className="mobile-commitment-copy">
                <div>{task.content}</div>
                {task.abilityPoints && (
                  <span>能力 +{task.abilityPoints}</span>
                )}
              </div>
              <div className="mobile-row-actions" aria-label={`${task.content} 操作`}>
                <button
                  type="button"
                  className="mobile-row-action"
                  onClick={() => moveTask(task.id, tomorrow, tasks.filter((item) => item.date === tomorrow).length)}
                >
                  明天
                </button>
                <button
                  type="button"
                  className="mobile-row-action"
                  onClick={() => moveTask(task.id, 'BACKLOG', tasks.filter((item) => item.date === 'BACKLOG').length)}
                >
                  收纳
                </button>
              </div>
            </article>
          ))}
          {activeCommitments.length === 0 && (
            <div className="mobile-empty-state">
              今天没有待推进承诺。点右上角加号写下一件事。
            </div>
          )}
        </div>
      </section>

      {isTaskComposerOpen && (
        <form
          id="mobile-task-sheet"
          className="mobile-task-sheet"
          aria-label="新增今日任务"
          onSubmit={addTodayTask}
        >
          <div className="mobile-task-sheet-head">
            <span>添加今日任务</span>
            <strong>今天</strong>
          </div>
          <input
            ref={taskInputRef}
            className="mobile-task-input"
            value={taskInput}
            onChange={(event) => setTaskInput(event.target.value)}
            placeholder="写下今天要推进的一件事"
            aria-label="今日任务内容"
          />
          <div className="mobile-task-sheet-actions">
            <button type="button" className="mobile-task-cancel" onClick={closeTaskComposer}>
              取消
            </button>
            <button type="submit" className="mobile-task-submit" disabled={trimmedTaskInput.length === 0}>
              添加任务
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MobileTodayForge;
