import React, { useEffect, useState } from 'react';
import { TrayNotification } from '../../types/tray';
import { cn } from '../../lib/utils';
import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  notification: TrayNotification;
  onClose: (id: string) => void;
}

export function Notification({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 进入动画
    setIsVisible(true);

    // 自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(notification.id), 300);
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const getIcon = () => {
    switch (notification.icon) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.icon) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full",
        "transform transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "p-4 rounded-lg border shadow-lg",
          getBgColor(),
          "flex items-start space-x-3"
        )}
      >
        {/* 图标 */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {notification.body}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(notification.id), 300);
          }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      </div>
    </div>
  );
}

interface NotificationCenterProps {
  notifications: TrayNotification[];
  onClose: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({ notifications, onClose, onClearAll }: NotificationCenterProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
      
      {/* 清除所有按钮 */}
      {notifications.length > 1 && (
        <button
          onClick={onClearAll}
          className="fixed top-4 right-4 z-50 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          清除所有通知
        </button>
      )}
    </div>
  );
}