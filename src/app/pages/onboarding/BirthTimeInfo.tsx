import { useNavigate } from 'react-router';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Star, Moon, Sun } from 'lucide-react';

export function BirthTimeInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl">Why we need this information</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sun className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Sun Sign</h3>
                <p className="text-sm text-muted-foreground">
                  Your birth date determines your Sun sign and core personality traits
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Moon & Rising Signs</h3>
                <p className="text-sm text-muted-foreground">
                  Birth time and location help us calculate your Moon and Ascendant signs for deeper insights
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/40 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Planetary Positions</h3>
                <p className="text-sm text-muted-foreground">
                  Exact birth details allow us to map all planetary positions in your chart
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/onboarding/birth-place')}
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
                i === 3 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
