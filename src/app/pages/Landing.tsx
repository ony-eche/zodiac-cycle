import { useNavigate } from 'react-router';
import { ZodiacCycleLogo } from '../components/ZodiacCycleLogo';
import { Button } from '../components/ui/button';
import { Moon, Star, Sparkles, Calendar } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <Moon className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/10',
      title: t('landing.feature1Title'),
      desc: t('landing.feature1Desc'),
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      bg: 'bg-secondary/20',
      title: t('landing.feature2Title'),
      desc: t('landing.feature2Desc'),
    },
    {
      icon: <Calendar className="w-6 h-6 text-primary" />,
      bg: 'bg-accent/40',
      title: t('landing.feature3Title'),
      desc: t('landing.feature3Desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector variant="icon" />
      </div>

      <header className="p-6">
        <ZodiacCycleLogo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="relative">
            <div className="absolute -top-8 left-1/4 text-primary/30"><Star className="w-6 h-6 animate-pulse" /></div>
            <div className="absolute -top-4 right-1/4 text-secondary/30"><Sparkles className="w-5 h-5 animate-pulse" style={{ animationDelay: '0.5s' }} /></div>
            <div className="absolute top-0 left-1/3 text-accent/40"><Moon className="w-4 h-4 animate-pulse" style={{ animationDelay: '1s' }} /></div>
          </div>

          <h1 className="text-5xl md:text-6xl tracking-wide">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              {t('landing.heroLine1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
              {t('landing.heroLine2')}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {t('welcome.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
            {features.map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center mx-auto`}>
                  {f.icon}
                </div>
                <h3 className="text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => navigate('/onboarding/welcome')}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            {t('welcome.cta')}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {t('landing.subCta')}
          </p>
        </div>
      </main>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
