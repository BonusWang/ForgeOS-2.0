import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useDocumentTitle = () => {
  const { tasks } = useAppStore();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.date === today && t.status === 'active');
    const remaining = todayTasks.length;
    document.title = remaining > 0 ? `[${remaining}] Forge-OS` : 'Forge-OS';
  }, [tasks]);
};
