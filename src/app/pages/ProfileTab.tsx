import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../context/UserDataContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ChevronRight, Edit3, Camera, X, Check, Bell, Mail, Smartphone, Moon, Star, Heart, Settings, User, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

// ─── Avatar Picker ────────────────────────────────────────────────────────────
const AVATAR_EMOJIS = [
  '🌟','✨','🌙','⭐','🔮','🌸','🦋','🌺','💫','🌊','🌈','🦄',
  '🌻','🍀','🌙','💎','🌙','🌷','🪷','🌿','🦚','🌟',
];

function AvatarPicker({ current, onSelect, onClose }: {
  current: string; onSelect: (avatar: string) => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<'emoji' | 'initials' | 'photo'>('emoji');
  const [customEmoji, setCustomEmoji] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { userData } = useUserData();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy w-full max-w-lg rounded-t-3xl p-6 border-t border-white/40 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 rounded-full bg-border/50 mx-auto"/>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Choose Avatar</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl"><X className="w-5 h-5 text-muted-foreground"/></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 glass rounded-2xl border border-white/30">
          {[
            { key: 'emoji', label: '😊 Emoji' },
            { key: 'initials', label: '✦ Initials' },
            { key: 'photo', label: '📷 Photo' },
          ].map(tab_ => (
            <button key={tab_.key} onClick={() => setTab(tab_.key as any)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === tab_.key ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-white/20'
              }`}>{tab_.label}</button>
          ))}
        </div>

        {tab === 'emoji' && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {AVATAR_EMOJIS.map(e => (
                <button key={e} onClick={() => onSelect(e)}
                  className={`h-11 rounded-2xl text-2xl flex items-center justify-center transition-all border-2 ${
                    current === e ? 'border-primary bg-primary/10 scale-110' : 'border-transparent glass hover:border-primary/30'
                  }`}>{e}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
                placeholder="Type any emoji..."
                className="flex-1 p-3 glass rounded-2xl border border-white/30 text-sm focus:outline-none focus:border-primary"/>
              {customEmoji && (
                <button onClick={() => onSelect(customEmoji)}
                  className="px-4 py-3 rounded-2xl bg-primary text-white text-sm font-semibold">Use</button>
              )}
            </div>
          </div>
        )}

        {tab === 'initials' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose a gradient for your initials avatar</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['from-purple-400 to-pink-400', 'pp'],
                ['from-pink-400 to-rose-400', 'pr'],
                ['from-violet-400 to-purple-400', 'vp'],
                ['from-rose-400 to-orange-400', 'ro'],
                ['from-indigo-400 to-purple-400', 'ip'],
                ['from-fuchsia-400 to-pink-400', 'fp'],
              ].map(([grad, key]) => {
                const initial = userData.name?.[0]?.toUpperCase() || '✦';
                return (
                  <button key={key} onClick={() => onSelect(`initials:${grad}`)}
                    className={`h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br ${grad} transition-all border-2 ${
                      current === `initials:${grad}` ? 'border-white scale-105 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}>{initial}</button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'photo' && (
          <div className="space-y-3">
            <div className="glass rounded-2xl p-6 border border-white/30 flex flex-col items-center gap-3 cursor-pointer"
              onClick={() => fileRef.current?.click()}>
              <Camera className="w-8 h-8 text-primary"/>
              <p className="text-sm font-semibold">Upload a photo</p>
              <p className="text-xs text-muted-foreground text-center">JPG or PNG, max 5MB. Your photo stays on your device.</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    if (ev.target?.result) onSelect(ev.target.result as string);
                  };
                  reader.readAsDataURL(file);
                }}/>
              <span className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold">Choose Photo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Avatar Display ───────────────────────────────────────────────────────────
function AvatarDisplay({ avatar, name, size = 'lg' }: { avatar: string; name: string; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-10 h-10 text-base';

  if (avatar.startsWith('data:image')) {
    return <img src={avatar} className={`${sz} rounded-full object-cover border-4 border-white/50 shadow-lg`} alt="avatar"/>;
  }
  if (avatar.startsWith('initials:')) {
    const grad = avatar.replace('initials:', '');
    const initial = name?.[0]?.toUpperCase() || '✦';
    return (
      <div className={`${sz} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold border-4 border-white/50 shadow-lg`}>
        {initial}
      </div>
    );
  }
  if (avatar.length <= 4) {
    // emoji
    return (
      <div className={`${sz} rounded-full glass border-4 border-white/50 shadow-lg flex items-center justify-center`}>
        {avatar}
      </div>
    );
  }
  // fallback initial
  const initial = name?.[0]?.toUpperCase() || '✦';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold border-4 border-white/50 shadow-lg`}>
      {initial}
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { userData, updateUserData } = useUserData();
  const [name, setName] = useState(userData.name || '');
  const [city, setCity] = useState(userData.currentCity || '');

  const save = () => {
    updateUserData({ name: name.trim() || userData.name, currentCity: city.trim() || userData.currentCity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy w-full max-w-lg rounded-t-3xl p-6 border-t border-white/40 space-y-5"
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 rounded-full bg-border/50 mx-auto"/>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl"><X className="w-5 h-5 text-muted-foreground"/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-medium">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full p-3.5 glass rounded-2xl border-2 border-white/30 text-sm focus:outline-none focus:border-primary transition-colors"/>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-medium">Current City</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              className="w-full p-3.5 glass rounded-2xl border-2 border-white/30 text-sm focus:outline-none focus:border-primary transition-colors"/>
          </div>
        </div>
        <button onClick={save}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold btn-glow flex items-center justify-center gap-2">
          <Check className="w-4 h-4"/> Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Notification Settings ────────────────────────────────────────────────────
function NotificationSettings({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('zodiac_notif_settings');
    return saved ? JSON.parse(saved) : {
      push: true, email: false, inApp: true,
      periodReminder: true, ovulationAlert: true, phaseChange: true,
      dailyInsights: true, transitAlerts: false,
      frequency: 'daily',
    };
  });

  const update = (key: string, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem('zodiac_notif_settings', JSON.stringify(next));
  };

  const Toggle = ({ k, label, sub }: { k: string; label: string; sub?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => update(k, !settings[k])}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings[k] ? 'bg-primary' : 'bg-border'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings[k] ? 'left-6' : 'left-0.5'}`}
          style={{ boxShadow: settings[k] ? '0 0 8px rgba(192,132,252,0.5)' : undefined }}/>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground"/>
        </button>
        <h2 className="text-2xl font-medium">Notification Settings</h2>
      </div>

      {/* Delivery channels */}
      <div className="glass rounded-3xl p-5 border border-white/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">How to notify you</h3>
        <div className="space-y-1">
          {[
            { k: 'push',  icon: <Smartphone className="w-4 h-4 text-primary"/>,  label: 'Push Notifications',  sub: 'On your device' },
            { k: 'email', icon: <Mail className="w-4 h-4 text-primary"/>,         label: 'Email Notifications', sub: 'Weekly digest' },
            { k: 'inApp', icon: <Bell className="w-4 h-4 text-primary"/>,         label: 'In-App Notifications', sub: 'Bell icon in dashboard' },
          ].map(item => (
            <div key={item.k} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl glass border border-white/30 flex items-center justify-center">{item.icon}</div>
                <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
              </div>
              <button onClick={() => update(item.k, !settings[item.k])}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings[item.k] ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${settings[item.k] ? 'left-6' : 'left-0.5'}`}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification types */}
      <div className="glass rounded-3xl p-5 border border-white/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">What to notify you about</h3>
        <Toggle k="periodReminder"  label="🔴 Period Reminder"    sub="3 days before your period" />
        <Toggle k="ovulationAlert"  label="🌕 Ovulation Window"   sub="When you enter your fertile window" />
        <Toggle k="phaseChange"     label="✨ Phase Changes"       sub="When your cycle phase shifts" />
        <Toggle k="dailyInsights"   label="🔮 Daily Insights"      sub="New AI predictions available" />
        <Toggle k="transitAlerts"   label="⭐ Transit Alerts"      sub="Significant planetary transits" />
      </div>

      {/* Frequency */}
      <div className="glass rounded-3xl p-5 border border-white/40">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">Frequency</h3>
        <div className="grid grid-cols-3 gap-2">
          {['daily', 'weekly', 'minimal'].map(f => (
            <button key={f} onClick={() => update('frequency', f)}
              className={`py-3 rounded-2xl text-xs font-semibold capitalize transition-all border-2 ${
                settings.frequency === f
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/30 glass text-muted-foreground hover:border-primary/30'
              }`}>{f}</button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {settings.frequency === 'daily' && 'Receive notifications daily as events occur'}
          {settings.frequency === 'weekly' && 'Weekly summary of your cycle & cosmic insights'}
          {settings.frequency === 'minimal' && 'Only the most important alerts (period + ovulation)'}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PROFILE TAB ─────────────────────────────────────────────────────────
export function ProfileTab() {
  const { userData, updateUserData, clearUserData } = useUserData();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [view, setView] = useState<'profile' | 'notifications'>('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [avatar, setAvatar] = useState<string>(() =>
    localStorage.getItem('zodiac_avatar') || ''
  );

  const saveAvatar = (a: string) => {
    setAvatar(a);
    localStorage.setItem('zodiac_avatar', a);
    setShowAvatarPicker(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUserData();
    navigate('/');
  };

  if (view === 'notifications') {
    return <NotificationSettings onBack={() => setView('profile')}/>;
  }

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-medium">{t('profile.title')}</h2>

      {/* ── Hero avatar card ── */}
      <div className="glass glossy rounded-3xl p-6 border border-white/40 flex flex-col items-center gap-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 pointer-events-none"/>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"/>

        {/* Avatar with edit button */}
        <div className="relative">
          <AvatarDisplay avatar={avatar} name={userData.name || ''} size="lg"/>
          <button onClick={() => setShowAvatarPicker(true)}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white btn-glow">
            <Camera className="w-4 h-4"/>
          </button>
        </div>

        {/* Name + sign */}
        <div className="text-center relative">
          <p className="text-xl font-bold">{userData.name || 'Starlighter'}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {userData.sun_sign ? `☀ ${userData.sun_sign}` : ''}{userData.sun_sign && userData.currentCity ? ' · ' : ''}{userData.currentCity || ''}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 w-full">
          {[
            { icon: '☀', label: 'Sun', value: userData.sun_sign || '—' },
            { icon: '🌙', label: 'Moon', value: userData.moon_sign || '—' },
            { icon: '⬆', label: 'Rising', value: userData.rising_sign || '—' },
          ].map(s => (
            <div key={s.label} className="flex-1 glass rounded-2xl p-3 border border-white/30 text-center">
              <p className="text-base">{s.icon}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className="text-xs font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Edit profile button */}
        <button onClick={() => setShowEditProfile(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/40 text-sm font-semibold text-primary">
          <Edit3 className="w-4 h-4"/> Edit Profile
        </button>
      </div>

      {/* ── Language ── */}
      <div className="glass rounded-3xl p-5 border border-white/40 space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('profile.language')}</h3>
        <LanguageSelector variant="full"/>
      </div>

      {/* ── Birth info ── */}
      <div className="glass rounded-3xl p-5 border border-white/40 space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('profile.birthInfo')}</h3>
        {[
          { label: t('profile.dateOfBirth'), value: userData.dateOfBirth ? format(new Date(userData.dateOfBirth), 'MMMM d, yyyy') : t('profile.notSet') },
          { label: t('profile.birthTime'),   value: userData.timeOfBirth || t('profile.notSet') },
          { label: t('profile.birthPlace'),  value: userData.placeOfBirth || t('profile.notSet') },
          { label: t('profile.currentCity'), value: userData.currentCity || t('profile.notSet') },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-right max-w-[55%]">{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Cycle info ── */}
      <div className="glass rounded-3xl p-5 border border-white/40 space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('profile.cycleInfo')}</h3>
        {[
          { label: t('profile.avgCycle'),       value: `28 ${t('profile.days')}` },
          { label: t('profile.lastPeriodStart'), value: userData.lastPeriodStart ? format(new Date(userData.lastPeriodStart), 'MMM d, yyyy') : t('profile.notSet') },
          { label: t('profile.lastPeriodEnd'),   value: userData.lastPeriodEnd ? format(new Date(userData.lastPeriodEnd), 'MMM d, yyyy') : t('profile.notSet') },
          { label: t('profile.tracksPeriods'),   value: userData.tracksPeriods ? t('profile.yes') : t('profile.no') },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Subscription ── */}
      <div className="glass rounded-3xl p-5 border border-white/40 space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('profile.subscription')}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('profile.status')}</span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
            userData.hasPaid
              ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/20'
              : 'bg-border/50 text-muted-foreground'
          }`}>
            {userData.hasPaid ? t('profile.premium') : t('profile.free')}
          </span>
        </div>
        {!userData.hasPaid && (
          <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold btn-glow">
            {t('profile.upgrade')}
          </button>
        )}
      </div>

      {/* ── Settings menu ── */}
      <div className="glass rounded-3xl border border-white/40 overflow-hidden">
        {[
          {
            icon: <Bell className="w-4 h-4 text-primary"/>,
            label: 'Notification Settings',
            sub: 'Push, email & in-app alerts',
            action: () => setView('notifications'),
          },
          {
            icon: <Shield className="w-4 h-4 text-primary"/>,
            label: t('profile.privacy'),
            sub: 'How we use your data',
            href: 'https://zodiaclycle.com/privacy',
          },
          {
            icon: <Star className="w-4 h-4 text-primary"/>,
            label: t('profile.terms'),
            sub: 'Terms of service',
            href: 'https://zodiaclycle.com/terms',
          },
          {
            icon: <Heart className="w-4 h-4 text-primary"/>,
            label: t('profile.contactSupport'),
            sub: 'Get help or share feedback',
            href: 'mailto:support@zodiaclycle.com',
          },
        ].map((item, i) => (
          <div key={item.label}>
            {item.href ? (
              <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl glass border border-white/30 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground"/>
              </a>
            ) : (
              <button onClick={item.action}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/10 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl glass border border-white/30 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground"/>
              </button>
            )}
            {i < 3 && <div className="mx-5 border-b border-white/10"/>}
          </div>
        ))}
      </div>

      {/* ── Logout ── */}
      <button onClick={handleLogout}
        className="w-full py-4 rounded-2xl glass border-2 border-rose-300/50 text-rose-500 font-bold hover:bg-rose-50/50 transition-all flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4"/> {t('profile.logout')}
      </button>

      <p className="text-center text-xs text-muted-foreground pb-2">{t('profile.version')}</p>

      {/* Modals */}
      {showAvatarPicker && (
        <AvatarPicker current={avatar} onSelect={saveAvatar} onClose={() => setShowAvatarPicker(false)}/>
      )}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)}/>
      )}
    </div>
  );
}