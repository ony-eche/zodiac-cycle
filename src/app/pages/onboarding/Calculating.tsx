import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Loader2, Sparkles } from 'lucide-react';

export function Calculating() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/paywall');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 text-center">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="space-y-6">
          <div className="relative">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Sparkles className="w-8 h-8 text-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl">Calculating your cosmic blueprint...</h1>
            
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Mapping planetary positions
              </p>
              <p className="flex items-center justify-center gap-2" style={{ animationDelay: '0.5s' }}>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Analyzing your birth chart
              </p>
              <p className="flex items-center justify-center gap-2" style={{ animationDelay: '1s' }}>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Predicting cycle patterns
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-xs text-muted-foreground">
            <strong className="block mb-2">Medical Disclaimer</strong>
            ZodiacCycle provides wellness insights based on astrology and cycle tracking. 
            It is not a medical diagnostic tool.
          </p>
        </div>
      </div>
    </div>
  );
}
