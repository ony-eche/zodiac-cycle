import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LastPeriodKnowledge() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t } = useTranslation();
  const [knows, setKnows] = useState<boolean | null>(null);

  const handleContinue = (value: boolean) => {
    setKnows(value);
    updateUserData({ knowsLastPeriod: value });
    navigate(value ? '/onboarding/last-period-dates' : '/onboarding/hormonal-tracking');
  };

  const options = [
    { value: true,  label: t('onboarding.lastPeriodKnowledge.yes'), desc: t('onboarding.lastPeriodKnowledge.yesDesc') },
    { value: false, label: t('onboarding.lastPeriodKnowledge.no'),  desc: t('onboarding.lastPeriodKnowledge.noDesc') },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.lastPeriodKnowledge.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.lastPeriodKnowledge.subtitle')}</p>
        </div>
        <div className="space-y-4">
          {options.map(({ value, label, desc }) => (
            <button key={String(value)} onClick={() => handleContinue(value)}
              className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${knows === value ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <div><h3 className="mb-1">{label}</h3><p className="text-sm text-muted-foreground">{desc}</p></div>
                {knows === value && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === 6 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />)}
        </div>
      </div>
    </div>
  );
}