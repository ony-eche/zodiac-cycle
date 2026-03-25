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
  
  // Store as YYYY-MM-DD string consistently
  const [date, setDate] = useState<string>(() => {
    if (userData.dateOfBirth) {
      // If it's already a string, use it; if it's a Date object, format it
      if (typeof userData.dateOfBirth === 'string') {
        return userData.dateOfBirth;
      }
      // Convert Date object to YYYY-MM-DD without timezone issues
      const d = new Date(userData.dateOfBirth);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  });

  const handleContinue = () => {
    if (date) {
      // Store as ISO date string (YYYY-MM-DD) without time component
      // This avoids timezone issues
      updateUserData({ dateOfBirth: date });
      navigate('/onboarding/birth-time');
    }
  };

  // Validate date is reasonable
  const isValidDate = () => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    // Check if date is between 1900 and today
    if (selectedDate < minDate || selectedDate > today) {
      return false;
    }
    
    // Check if user is at least 13 years old (for legal reasons)
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    if (age < 13 || (age === 13 && monthDiff < 0)) {
      return false;
    }
    
    return true;
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
            {date && !isValidDate() && (
              <p className="text-sm text-red-500 mt-1">
                {new Date(date) > new Date() 
                  ? t('onboarding.birthDate.futureError', 'Birth date cannot be in the future')
                  : t('onboarding.birthDate.ageError', 'You must be at least 13 years old')
                }
              </p>
            )}
          </div>
          <Button
            onClick={handleContinue}
            disabled={!date || !isValidDate()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}