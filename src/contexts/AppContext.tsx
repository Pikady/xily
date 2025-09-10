import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppStateData, ThemeMode } from '@/types/app';

type AppAction =
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_FLOAT_WINDOW' }
  | { type: 'SET_FLOAT_WINDOW_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null };

const initialState: AppStateData = {
  theme: 'system',
  sidebar_open: true,
  float_window_visible: true, // 默认显示悬浮窗
  float_window_position: { x: 100, y: 100 },
  active_modal: null,
  loading: false,
  online: navigator.onLine,
  error: null,
};

function appReducer(state: AppStateData, action: AppAction): AppStateData {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebar_open: !state.sidebar_open };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebar_open: action.payload };
    case 'TOGGLE_FLOAT_WINDOW':
      return { ...state, float_window_visible: !state.float_window_visible };
    case 'SET_FLOAT_WINDOW_POSITION':
      return { ...state, float_window_position: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ONLINE':
      return { ...state, online: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_MODAL':
      return { ...state, active_modal: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppStateData;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 从localStorage恢复状态
  useEffect(() => {
    const savedFloatWindowVisible = localStorage.getItem('float-window-visible');
    const savedFloatWindowPosition = localStorage.getItem('float-window-position');
    
    if (savedFloatWindowVisible !== null) {
      dispatch({ type: 'TOGGLE_FLOAT_WINDOW' });
    }
    
    if (savedFloatWindowPosition) {
      try {
        const position = JSON.parse(savedFloatWindowPosition);
        dispatch({ type: 'SET_FLOAT_WINDOW_POSITION', payload: position });
      } catch (error) {
        console.error('Failed to parse saved position:', error);
      }
    }
  }, []);

  // 保存悬浮窗状态到localStorage
  useEffect(() => {
    localStorage.setItem('float-window-visible', state.float_window_visible.toString());
  }, [state.float_window_visible]);

  // 保存悬浮窗位置到localStorage
  useEffect(() => {
    localStorage.setItem('float-window-position', JSON.stringify(state.float_window_position));
  }, [state.float_window_position]);

  // 监听在线状态
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 应用主题
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}