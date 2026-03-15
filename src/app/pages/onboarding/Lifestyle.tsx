import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Lifestyle() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t } = useTranslation();
  const [birthControl, setBirthControl] = useState<boolean | null>(null);

  const handleContinue = (value: boolean) => {
    setBirthControl(value);
    updateUserData({ lifestyle: { birthControl: value } });
    navigate('/onboarding/current-city');
  };

  const options = [
    { value: true,  label: t('onboarding.lifestyle.yes'), desc: t('onboarding.lifestyle.yesDesc') },
    { value: false, label: t('onboarding.lifestyle.no'),  desc: t('onboarding.lifestyle.noDesc') },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.lifestyle.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.lifestyle.subtitle')}</p>
        </div>
        <div className="space-y-4">
          {options.map(({ value, label, desc }) => (
            <button
              key={String(value)}
              onClick={() => handleContinue(value)}
              className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${birthControl === value ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                {birthControl === value && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 8 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}