import { useEffect, useRef } from 'react';

const canUseHistory = () => typeof window !== 'undefined' && typeof window.history?.pushState === 'function';

export const useMobilePanelHistory = (
  isOpen: boolean,
  closePanel: () => void,
  panelId: string
) => {
  const closePanelRef = useRef(closePanel);
  const isPanelHistoryActiveRef = useRef(false);

  useEffect(() => {
    closePanelRef.current = closePanel;
  }, [closePanel]);

  useEffect(() => {
    if (!isOpen || !canUseHistory()) return;

    const currentState =
      window.history.state && typeof window.history.state === 'object'
        ? window.history.state
        : {};

    window.history.pushState(
      { ...currentState, mobilePanel: panelId },
      '',
      window.location.href
    );
    isPanelHistoryActiveRef.current = true;

    const handlePopState = () => {
      if (!isPanelHistoryActiveRef.current) return;
      isPanelHistoryActiveRef.current = false;
      closePanelRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      isPanelHistoryActiveRef.current = false;
    };
  }, [isOpen, panelId]);
};
