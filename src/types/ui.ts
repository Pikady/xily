// 重新导出前端类型（避免与 app.ts 中同名类型冲突，使用别名）
export type {
  UIState,
  ViewMode,
  WorkFormData,
  AnalyticsData,
  UserPreferences
} from './frontend';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'explore' | 'utilize';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children?: React.ReactNode;
}

export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  showValue?: boolean;
  className?: string;
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}