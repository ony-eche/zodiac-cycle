import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../components/LanguageSelector';

export function Welcome() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      updateUserData({ name: name.trim() });
      navigate('/onboarding/birth-date');
    }
  };

  // App name greeting in each supported language
  const greetings: Record<string, string> = {
    de: 'Hallo, ich bin ZodiacCycle!',
    fr: 'Bonjour, je suis ZodiacCycle\u00a0!',
    es: '\u00a1Hola, soy ZodiacCycle!',
    pt: 'Ol\u00e1, sou o ZodiacCycle!',
  };
  const lang = i18n.language.split('-')[0];
  const title = greetings[lang] || "Hi, I'm ZodiacCycle!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="icon" />
      </div>
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl">{title}</h1>
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          <p className="text-muted-foreground">{t('welcome.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-muted-foreground">
              {t('auth.name')}
            </label>
            <Input
              id="name"
              type="text"
              placeholder={t('auth.name')}
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
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}