import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Check, Sparkles } from 'lucide-react';

export function Paywall() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();

  const handlePurchase = () => {
    updateUserData({ hasPaid: true });
    navigate('/dashboard');
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

        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 rounded-3xl p-8 space-y-6">
          {/* Price */}
          <div className="text-center space-y-2">
            <div className="flex items-end justify-center gap-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                $1
              </span>
              <span className="text-muted-foreground mb-2">USD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get started with your cosmic wellness journey
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 py-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-lg shadow-lg"
          >
            Get Full Access Now
          </Button>

          {/* Fine Print */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Includes full app access for 1 week and $5.99 per month for full access to app features after subscription ends
          </p>
        </div>

        <div className="text-center">
          <button 
            onClick={handlePurchase}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
