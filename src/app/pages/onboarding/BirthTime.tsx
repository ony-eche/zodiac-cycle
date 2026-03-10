import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function BirthTime() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [time, setTime] = useState('');

  const handleContinue = () => {
    updateUserData({ timeOfBirth: time });
    navigate('/onboarding/birth-time-info');
  };

  const handleDontKnow = () => {
    updateUserData({ timeOfBirth: 'unknown' });
    navigate('/onboarding/birth-time-info');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl">What time were you born?</h1>
          <p className="text-muted-foreground">
            This helps us calculate your exact birth chart
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="time" className="text-sm text-muted-foreground">
              Time of Birth (if you're not sure, click "I don't know")
            </label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-input-background border-border rounded-xl px-4 py-6 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              disabled={!time}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
            >
              Continue
            </Button>
            
            <Button
              onClick={handleDontKnow}
              variant="outline"
              className="w-full border-border rounded-xl py-6"
            >
              I don't know
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            We can still make predictions without your exact birth time
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === 2 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
