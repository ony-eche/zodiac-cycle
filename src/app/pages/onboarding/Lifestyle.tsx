import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Check } from 'lucide-react';

export function Lifestyle() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [birthControl, setBirthControl] = useState<boolean | null>(null);

  const handleContinue = (value: boolean) => {
    setBirthControl(value);
    updateUserData({
      lifestyle: {
        birthControl: value,
      },
    });
    navigate('/onboarding/current-city');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl">Are you using hormonal birth control?</h1>
          <p className="text-muted-foreground">
            This affects cycle predictions and hormonal patterns
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleContinue(true)}
            className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${
              birthControl === true ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Yes</h3>
                <p className="text-sm text-muted-foreground">
                  I'm currently using hormonal birth control
                </p>
              </div>
              {birthControl === true && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => handleContinue(false)}
            className={`w-full bg-card border-2 rounded-2xl p-6 text-left transition-all hover:border-primary ${
              birthControl === false ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">No</h3>
                <p className="text-sm text-muted-foreground">
                  I'm not using hormonal birth control
                </p>
              </div>
              {birthControl === false && (
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
                i === 8 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
