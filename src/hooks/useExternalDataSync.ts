import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

/**
 * Listen for external data changes (MCP Server writes) via SSE.
 * Only active in dev server mode (localhost / 127.0.0.1).
 * On notification, rehydrates Zustand store from storage.
 */
export function useExternalDataSync() {
  useEffect(() => {
    if (!window.location.hostname.match(/localhost|127\.0\.0\.1/)) return

    const evtSource = new EventSource('/__forge_data__/__events__')

    evtSource.onmessage = () => {
      // Rehydrate Zustand persist from storage file
      useAppStore.persist.rehydrate()
    }

    return () => {
      evtSource.close()
    }
  }, [])
}
