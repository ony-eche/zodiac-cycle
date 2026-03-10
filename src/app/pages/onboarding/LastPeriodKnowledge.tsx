import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Check } from 'lucide-react';

export function LastPeriodKnowledge() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [knows, setKnows] = useState<boolean | null>(null);

  const handleContinue = (value: boolean) => {
    setKnows(value);
    updateUserData({ knowsLastPeriod: value });
    if (value) {
      navigate('/onboarding/last-period-dates');
    } else {
      navigate('/onboarding/hormonal-tracking');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl">Do you know when your last period was?</h1>
          <p className="text-muted-foreground">
            This helps us predict your upcoming cycle
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleContinue(true)}
            className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${
              knows === true ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Yes, I remember</h3>
                <p className="text-sm text-muted-foreground">
                  I can provide the dates
                </p>
              </div>
              {knows === true && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => handleContinue(false)}
            className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${
              knows === false ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">No, I don't remember</h3>
                <p className="text-sm text-muted-foreground">
                  Skip this step
                </p>
              </div>
              {knows === false && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === 6 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
