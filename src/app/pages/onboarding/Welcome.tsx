import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sparkles } from 'lucide-react';

export function Welcome() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      updateUserData({ name: name.trim() });
      navigate('/onboarding/birth-date');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl">Hi, I'm ZodiacCycle!</h1>
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          
          <p className="text-muted-foreground">
            I'm here to help you understand the cosmic influences on your cycle. Let's get started!
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-muted-foreground">
              How should we address you?
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              className="bg-input-background border-border rounded-xl px-4 py-6 text-lg"
              autoFocus
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            Continue
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === 0 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
