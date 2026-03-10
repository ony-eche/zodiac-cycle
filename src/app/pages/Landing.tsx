import { useNavigate } from 'react-router';
import { ZodiacCycleLogo } from '../components/ZodiacCycleLogo';
import { Button } from '../components/ui/button';
import { Moon, Star, Sparkles, Calendar } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <ZodiacCycleLogo />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Decorative elements */}
          <div className="relative">
            <div className="absolute -top-8 left-1/4 text-primary/30">
              <Star className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute -top-4 right-1/4 text-secondary/30">
              <Sparkles className="w-5 h-5 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute top-0 left-1/3 text-accent/40">
              <Moon className="w-4 h-4 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl tracking-wide">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Your Cycle,
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
              Your Stars
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Discover how planetary transits influence your menstrual cycle. 
            Track your period while exploring the cosmic connections.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Full Birth Chart</h3>
              <p className="text-sm text-muted-foreground">
                Complete astrological analysis based on your exact birth time and location
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Transit Insights</h3>
              <p className="text-sm text-muted-foreground">
                Understand how current planetary movements affect your cycle and wellness
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/40 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg">Smart Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Period and symptom tracking combined with astrological timing
              </p>
            </div>
          </div>

          <Button 
onClick={() => navigate('/onboarding/welcome')}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Try the App
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Get started with your personalized cosmic wellness journey
          </p>
        </div>
      </main>

      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
