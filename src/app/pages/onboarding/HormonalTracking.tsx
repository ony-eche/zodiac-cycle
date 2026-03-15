import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { Checkbox } from '../../components/ui/checkbox';
import { useTranslation } from 'react-i18next';

export function HormonalTracking() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t } = useTranslation();
  const [mood, setMood] = useState('neutral');
  const [stressLevel, setStressLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([5]);
  const [headaches, setHeadaches] = useState(false);
  const [cramps, setCramps] = useState(false);
  const [libido, setLibido] = useState('normal');

  const handleContinue = () => {
    updateUserData({
      hormonalTracking: {
        mood, stressLevel: stressLevel[0].toString(),
        sleepQuality: sleepQuality[0].toString(),
        headaches, cramps, libido,
      },
    });
    navigate('/onboarding/lifestyle');
  };

  const moodOptions   = ['happy', 'neutral', 'sad'];
  const libidoOptions = ['low', 'normal', 'high'];

  // Translated mood labels — keyed by English value so storage stays consistent
  const moodLabel: Record<string, string> = {
    happy:   t('cycle.moods.happy').replace(/^[^\s]+\s/, ''),
    neutral: 'Neutral',
    sad:     t('cycle.moods.sad').replace(/^[^\s]+\s/, ''),
  };

  const libidoLabel: Record<string, string> = {
    low:    t('onboarding.lifestyle.no') === 'No' ? 'Low'    : t('onboarding.lifestyle.no'),
    normal: 'Normal',
    high:   t('onboarding.lifestyle.yes') === 'Yes' ? 'High' : t('onboarding.lifestyle.yes'),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.hormonal.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.hormonal.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">

          {/* Mood */}
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">{t('cycle.log.mood')}</label>
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((option) => (
                <button key={option} onClick={() => setMood(option)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${mood === option ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  {moodLabel[option] || option}
                </button>
              ))}
            </div>
          </div>

          {/* Stress */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm text-muted-foreground">{t('home.stress')}</label>
              <span className="text-sm font-medium">{stressLevel[0]}/10</span>
            </div>
            <Slider value={stressLevel} onValueChange={setStressLevel} max={10} min={1} step={1} className="w-full" />
          </div>

          {/* Sleep */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm text-muted-foreground">{t('home.sleep')}</label>
              <span className="text-sm font-medium">{sleepQuality[0]}/10</span>
            </div>
            <Slider value={sleepQuality} onValueChange={setSleepQuality} max={10} min={1} step={1} className="w-full" />
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">{t('cycle.log.symptoms')}</label>
            <div className="space-y-3">
              {[
                { id: 'headaches', checked: headaches, onChange: setHeadaches, label: t('cycle.symptoms.headache') },
                { id: 'cramps',    checked: cramps,    onChange: setCramps,    label: t('cycle.symptoms.cramps') },
              ].map(({ id, checked, onChange, label }) => (
                <div key={id} className="flex items-center space-x-2 p-3 rounded-xl border border-border">
                  <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v as boolean)} />
                  <label htmlFor={id} className="flex-1 cursor-pointer">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Libido */}
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Libido</label>
            <div className="grid grid-cols-3 gap-2">
              {libidoOptions.map((option) => (
                <button key={option} onClick={() => setLibido(option)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${libido === option ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  {libidoLabel[option] || option}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleContinue} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl">
            {t('onboarding.next')}
          </Button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === 7 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />)}
        </div>
      </div>
    </div>
  );
}