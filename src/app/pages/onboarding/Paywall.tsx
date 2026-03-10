import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Check, Sparkles } from 'lucide-react';

export function Paywall() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [selected, setSelected] = useState<'paid' | 'free' | null>(null);

  const handlePurchase = () => {
    updateUserData({ hasPaid: true });
    navigate('/signup');
  };

  const handleSkip = () => {
    updateUserData({ hasPaid: false });
    navigate('/signup');
  };

  const features = [
    'Complete birth chart analysis',
    'Daily transit predictions',
    'Period cycle tracking & forecasting',
    'Hormonal pattern insights',
    'Moon phase integration',
    'Personalized wellness tips',
    'Unlimited chart access',
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl">Your cosmic journey awaits!</h1>
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          <p className="text-muted-foreground">
            Unlock your personalized chart and full app features
          </p>
        </div>

        {/* Plan selector */}
        <div className="space-y-3">

          {/* Paid plan */}
          <button
            onClick={() => setSelected('paid')}
            className={`w-full text-left bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 rounded-3xl p-6 transition-all ${
              selected === 'paid' ? 'border-primary shadow-lg scale-[1.01]' : 'border-primary/20'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  $1
                </span>
                <span className="text-muted-foreground mb-1">USD</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === 'paid' ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {selected === 'paid' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              1 week full access · then $5.99/month
            </p>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Free plan */}
          <button
            onClick={() => setSelected('free')}
            className={`w-full text-left bg-card border-2 rounded-3xl p-6 transition-all ${
              selected === 'free' ? 'border-primary shadow-md' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Continue for free</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Basic cycle tracking only
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === 'free' ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {selected === 'free' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={selected === 'paid' ? handlePurchase : handleSkip}
          disabled={!selected}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-lg shadow-lg disabled:opacity-40"
        >
          {selected === 'paid' ? 'Get Full Access ✦' : selected === 'free' ? 'Continue for Free →' : 'Select a plan to continue'}
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">
          Payment handled securely. Cancel anytime. Your data is always private.
        </p>
      </div>
    </div>
  );
}