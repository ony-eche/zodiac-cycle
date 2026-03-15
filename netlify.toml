import { lazy, Suspense, useState } from 'react';
import { ZodiacCycleLogo } from '../components/ZodiacCycleLogo';
import { Bell, Home, Droplet, Star, TrendingUp, MessageCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../context/UserDataContext';
import { generateNotifications } from '../../lib/notifications';
import { NotificationDropdown } from '../components/NotificationDropdown';
import InstallPrompt from '../components/InstallPrompt';

const HomeTab     = lazy(() => import('./HomeTab').then(m => ({ default: m.HomeTab })));
const ChartTab    = lazy(() => import('./ChartTab').then(m => ({ default: m.ChartTab })));
const ProfileTab  = lazy(() => import('./ProfileTab').then(m => ({ default: m.ProfileTab })));
const CycleTab    = lazy(() => import('./CycleTab').then(m => ({ default: m.CycleTab })));
const MessagesTab = lazy(() => import('./MessagesTab').then(m => ({ default: m.MessagesTab })));
const TransitsTab = lazy(() => import('./TransitsTab').then(m => ({ default: m.TransitsTab })));

type Tab = 'home' | 'cycle' | 'chart' | 'transits' | 'messages' | 'profile';

function TabLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = generateNotifications(
    { lastPeriodStart: userData.lastPeriodStart, sun_sign: userData.sun_sign, moon_sign: userData.moon_sign },
    t,
  );
  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { id: 'home',     label: t('nav.home'),     icon: Home },
    { id: 'cycle',    label: t('nav.cycle'),    icon: Droplet },
    { id: 'chart',    label: t('nav.chart'),    icon: Star },
    { id: 'transits', label: t('nav.transits'), icon: TrendingUp },
    { id: 'messages', label: t('nav.messages'), icon: MessageCircle },
    { id: 'profile',  label: t('nav.profile'),  icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Glossy frosted header */}
      <header className="border-b border-white/30 nav-glass px-5 py-3 flex items-center justify-between sticky top-0 z-20">
        <ZodiacCycleLogo />
        <div className="relative">
          <button
            className="relative p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
            onClick={() => setShowNotifications(prev => !prev)}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full badge-glow" />
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown
              onNavigate={(tab) => { setActiveTab(tab); setShowNotifications(false); }}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-5 pt-5">
        <Suspense fallback={<TabLoader />}>
          {activeTab === 'home'     && <HomeTab onNavigateToMessages={() => setActiveTab('messages')} />}
          {activeTab === 'cycle'    && <CycleTab />}
          {activeTab === 'chart'    && <ChartTab />}
          {activeTab === 'transits' && <TransitsTab />}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'profile'  && <ProfileTab />}
        </Suspense>
      </main>

      {/* Glassmorphism bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 nav-glass border-t border-white/30 px-2 py-2 z-10">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const showBadge = id === 'messages' && unreadCount > 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-primary nav-active' : 'text-muted-foreground hover:text-primary/70 hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(192,132,252,0.7)]' : ''}`} />
                  {showBadge && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full badge-glow" />}
                </div>
                <span className={`text-xs transition-all ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {label}
                </span>
                {isActive && <div className="w-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary" />}
              </button>
            );
          })}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  );
}