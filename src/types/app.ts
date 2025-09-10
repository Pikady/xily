export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppState {
  theme: ThemeMode;
  sidebar_open: boolean;
  float_window_visible: boolean;
  float_window_position: {
    x: number;
    y: number;
  };
  active_modal: string | null;
  loading: boolean;
  online: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  type: string;
  data?: any;
  open: boolean;
}

export interface KeyboardShortcuts {
  toggle_timer: string;
  start_pause: string;
  stop_timer: string;
  toggle_sidebar: string;
  toggle_float_window: string;
  quick_add_work: string;
}

export interface AppSettings {
  theme: ThemeMode;
  language: string;
  auto_start: boolean;
  notifications: boolean;
  sounds: boolean;
  shortcuts: KeyboardShortcuts;
}