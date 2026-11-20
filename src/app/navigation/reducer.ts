import type { ChapterId } from './chapters';

export type NavigationState = {
  current: ChapterId;
  target: ChapterId | null;
  phase: 'idle' | 'exiting' | 'entering';
  revision: number;
};

export type NavigationAction =
  | { type: 'navigate'; to: ChapterId; immediate?: boolean }
  | { type: 'covered' | 'revealed'; revision: number }
  | { type: 'skip' };

export function initialNavigation(current: ChapterId): NavigationState {
  return { current, target: null, phase: 'idle', revision: 0 };
}

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'navigate':
      if (state.phase !== 'idle' || state.current === action.to) return state;
      return action.immediate
        ? { ...initialNavigation(action.to), revision: state.revision + 1 }
        : { ...state, target: action.to, phase: 'exiting', revision: state.revision + 1 };
    case 'covered':
      if (action.revision !== state.revision || state.phase !== 'exiting' || !state.target) return state;
      return { ...state, current: state.target, phase: 'entering' };
    case 'revealed':
      if (action.revision !== state.revision || state.phase !== 'entering') return state;
      return { ...state, target: null, phase: 'idle' };
    case 'skip':
      if (state.phase === 'idle') return state;
      return { ...initialNavigation(state.target ?? state.current), revision: state.revision + 1 };
  }
}
