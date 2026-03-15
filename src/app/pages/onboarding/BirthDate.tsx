import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BirthDate() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUserData();
  const { t } = useTranslation();
  const [date, setDate] = useState<string>(
    userData.dateOfBirth ? userData.dateOfBirth.toISOString().split('T')[0] : ''
  );

  const handleContinue = () => {
    if (date) {
      updateUserData({ dateOfBirth: new Date(date) });
      navigate('/onboarding/birth-time');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">Nice to meet you, {userData.name}! ✨</h1>
          <p className="text-muted-foreground">{t('onboarding.birthDate.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('profile.dateOfBirth')}</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className="w-full pl-12 pr-4 py-4 text-lg bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={!date}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
