// <gen:begin hooks>
import { useState, useCallback } from 'react';
import { AppState, PageId, FEATURES } from './types';

const initialState: AppState = {
  currentPage: '홈',
  counters: {'홈': 0, '기록추가': 0},
  lastUpdated: new Date().toISOString()
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  const setCurrentPage = useCallback((pageId: PageId) => {
    setState(prev => ({
      ...prev,
      currentPage: pageId,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const incrementCounter = useCallback((feature: string) => {
    setState(prev => ({
      ...prev,
      counters: {
        ...prev.counters,
        [feature]: (prev.counters[feature] || 0) + 1
      },
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const resetCounter = useCallback((feature: string) => {
    setState(prev => ({
      ...prev,
      counters: {
        ...prev.counters,
        [feature]: 0
      },
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const getFeature = useCallback((id: PageId) => {
    return FEATURES.find(f => f.id === id);
  }, []);

  return {
    state,
    actions: {
      setCurrentPage,
      incrementCounter,
      resetCounter,
      getFeature
    }
  };
}

// <gen:end hooks>