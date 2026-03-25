import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LastPeriodDates() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUserData();
  const { t } = useTranslation();
  
  // ✅ Initialize from existing user data if available
  const [startDate, setStartDate] = useState<string>(() => {
    if (userData.lastPeriodStart) {
      // If it's already a string, use it; if it's a Date object (old data), format it
      if (typeof userData.lastPeriodStart === 'string') {
        return userData.lastPeriodStart;
      }
      // Handle old Date object format (fallback)
      const d = new Date(userData.lastPeriodStart);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return '';
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    if (userData.lastPeriodEnd) {
      if (typeof userData.lastPeriodEnd === 'string') {
        return userData.lastPeriodEnd;
      }
      const d = new Date(userData.lastPeriodEnd);
      return `${d.getFullYear()}-${String(d.getMonth()  + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return '';
  });
  
  const today = new Date().toISOString().split('T')[0];

  const handleContinue = () => {
    if (startDate && endDate) {
      // ✅ Store as ISO date strings (YYYY-MM-DD)
      updateUserData({ 
        lastPeriodStart: startDate,
        lastPeriodEnd: endDate 
      });
      navigate('/onboarding/hormonal-tracking');
    }
  };

  // Validate end date is not before start date
  const isValidRange = () => {
    if (!startDate || !endDate) return false;
    return endDate >= startDate;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.lastPeriod.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.lastPeriod.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('profile.lastPeriodStart')}</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { 
                    setStartDate(e.target.value); 
                    // If end date is before new start date, clear end date
                    if (endDate && e.target.value > endDate) setEndDate(''); 
                  }}
                  max={today}
                  min="2000-01-01"
                  className="w-full pl-12 pr-4 py-4 text-lg bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('profile.lastPeriodEnd')}</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={today}
                  min={startDate || '2000-01-01'}
                  disabled={!startDate}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {!startDate && (
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.lastPeriod.pickStartFirst', 'Pick a start date first')}
                </p>
              )}
              {startDate && endDate && !isValidRange() && (
                <p className="text-xs text-red-500">
                  {t('onboarding.lastPeriod.endAfterStart', 'End date must be after start date')}
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={handleContinue} 
            disabled={!startDate || !endDate || !isValidRange()} 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 6 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}