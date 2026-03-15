import { useNavigate } from 'react-router';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Star, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BirthTimeInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = [
    {
      icon: <Sun className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/10',
      title: t('chart.sun'),
      desc: t('birthTimeInfo.sunDesc'),
    },
    {
      icon: <Moon className="w-6 h-6 text-primary" />,
      bg: 'bg-secondary/20',
      title: `${t('chart.moon')} & ${t('chart.rising')}`,
      desc: t('birthTimeInfo.moonDesc'),
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      bg: 'bg-accent/40',
      title: t('birthTimeInfo.planetsTitle'),
      desc: t('birthTimeInfo.planetsDesc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-4">
          <h1 className="text-3xl">{t('birthTimeInfo.title')}</h1>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-6">
            {items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => navigate('/onboarding/birth-place')}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 3 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}