import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { generateNotifications, type AppNotification, type NotificationType } from '../../lib/notifications';
import { useUserData } from '../context/UserDataContext';

interface Props {
  onNavigate: (tab: 'messages' | 'transits' | 'cycle') => void;
  onClose: () => void;
}

const TYPE_COLORS: Record<NotificationType, string> = {
  period:     'bg-rose-100 border-rose-200',
  ovulation:  'bg-amber-50 border-amber-200',
  phase:      'bg-purple-50 border-purple-200',
  prediction: 'bg-primary/5 border-primary/20',
  transit:    'bg-blue-50 border-blue-200',
};

export function NotificationDropdown({ onNavigate, onClose }: Props) {
  const { userData } = useUserData();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const generated = generateNotifications(
      { lastPeriodStart: userData.lastPeriodStart, sun_sign: userData.sun_sign, moon_sign: userData.moon_sign },
      t,
    );
    setNotifications(generated);
  }, [userData, t]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClick = (n: AppNotification) => {
    if (n.action) onNavigate(n.action);
    setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, unread: false } : p));
    onClose();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
      style={{ maxHeight: '480px', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              {t('notifications.markAllRead')}
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
            <span className="text-3xl">🔔</span>
            <p className="text-sm font-medium">{t('notifications.empty')}</p>
            <p className="text-xs text-muted-foreground">{t('notifications.emptyBody')}</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 border-b border-border/50 last:border-0 hover:bg-accent/10 transition-colors ${n.unread ? 'bg-primary/3' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${n.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {n.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}