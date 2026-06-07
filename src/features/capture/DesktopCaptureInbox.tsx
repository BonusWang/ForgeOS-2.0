import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import AsciiBox from '../../components/AsciiBox';
import { useAppStore } from '../../store/useAppStore';
import type { InboxItem } from '../../types';

const getInboxSource = (item: InboxItem) => {
  if (item.abilityName) return `能力 · ${item.abilityName}`;
  if (item.objectiveTitle) return `目标 · ${item.objectiveTitle}`;
  return '待澄清';
};

const DesktopCaptureInbox: React.FC = () => {
  const inboxItems = useAppStore((s) => s.inboxItems);
  const addInboxItem = useAppStore((s) => s.addInboxItem);
  const addTask = useAppStore((s) => s.addTask);
  const removeFromInbox = useAppStore((s) => s.removeFromInbox);
  const addInspiration = useAppStore((s) => s.addInspiration);
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const pendingItems = inboxItems.filter((item) => !item.completed);
  const pendingCount = pendingItems.length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = addInboxItem(draft);
    if (!id) return;
    setDraft('');
    setIsOpen(true);
  };

  const clarifyAsToday = (item: InboxItem) => {
    addTask(item.content, today, item.abilityId, item.abilityPoints);
    removeFromInbox(item.id);
  };

  const clarifyAsBacklog = (item: InboxItem) => {
    addTask(item.content, 'BACKLOG', item.abilityId, item.abilityPoints);
    removeFromInbox(item.id);
  };

  const clarifyAsInspiration = (item: InboxItem) => {
    addInspiration({
      content: item.content,
      source: getInboxSource(item),
      tags: ['待澄清'],
    });
    removeFromInbox(item.id);
  };

  return (
    <AsciiBox title="捕捉箱 / 待澄清" className="desktop-capture-inbox">
      <form onSubmit={handleSubmit} className="desktop-capture-form">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="font-body desktop-capture-input"
          placeholder="先收进来，稍后澄清"
          aria-label="输入待澄清事项"
        />
        <button type="submit" className="font-caption desktop-capture-submit">
          收集
        </button>
        <button
          type="button"
          className="font-caption desktop-capture-toggle"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
        >
          待澄清 {pendingCount}
        </button>
      </form>

      {isOpen && (
        <div className="desktop-capture-list" aria-label="待澄清列表">
          {pendingItems.length === 0 ? (
            <div className="font-body desktop-capture-empty">
              暂无待澄清事项
            </div>
          ) : (
            pendingItems.map((item) => (
              <div key={item.id} className="desktop-capture-item">
                <div className="desktop-capture-copy">
                  <div className="font-body">{item.content}</div>
                  <div className="font-caption desktop-capture-source">
                    {getInboxSource(item)}
                  </div>
                </div>
                <div className="desktop-capture-actions">
                  <button type="button" onClick={() => clarifyAsToday(item)}>
                    今日任务
                  </button>
                  <button type="button" onClick={() => clarifyAsBacklog(item)}>
                    待安排任务
                  </button>
                  <button type="button" onClick={() => clarifyAsInspiration(item)}>
                    灵感
                  </button>
                  <button type="button" onClick={() => removeFromInbox(item.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AsciiBox>
  );
};

export default DesktopCaptureInbox;
