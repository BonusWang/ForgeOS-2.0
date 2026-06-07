import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getTodayString, getWeekStart } from '../utils/date';

export const useWeekCleanup = () => {
  const { config, updateConfig } = useAppStore();

  useEffect(() => {
    const today = getTodayString();
    const todayWeekStart = getWeekStart();

    // First time visit or same day - no action needed beyond updating lastVisit
    if (config.lastVisitDate === today) return;

    updateConfig({ currentWeekStart: todayWeekStart, lastVisitDate: today });
  }, [config.lastVisitDate, updateConfig]);
};
