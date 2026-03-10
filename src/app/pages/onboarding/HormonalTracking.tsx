import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { Checkbox } from '../../components/ui/checkbox';

export function HormonalTracking() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [mood, setMood] = useState('neutral');
  const [stressLevel, setStressLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([5]);
  const [headaches, setHeadaches] = useState(false);
  const [cramps, setCramps] = useState(false);
  const [libido, setLibido] = useState('normal');

  const handleContinue = () => {
    updateUserData({
      hormonalTracking: {
        mood,
        stressLevel: stressLevel[0].toString(),
        sleepQuality: sleepQuality[0].toString(),
        headaches,
        cramps,
        libido,
      },
    });
    navigate('/onboarding/lifestyle');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl">How are you feeling?</h1>
          <p className="text-muted-foreground">
            This helps us understand your current state
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-6">
            {/* Mood */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Current Mood</label>
              <div className="grid grid-cols-3 gap-2">
                {['happy', 'neutral', 'sad'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setMood(option)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${
                      mood === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm text-muted-foreground">Stress Level</label>
                <span className="text-sm font-medium">{stressLevel[0]}/10</span>
              </div>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm text-muted-foreground">Sleep Quality</label>
                <span className="text-sm font-medium">{sleepQuality[0]}/10</span>
              </div>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Current Symptoms</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 rounded-xl border border-border">
                  <Checkbox
                    id="headaches"
                    checked={headaches}
                    onCheckedChange={(checked) => setHeadaches(checked as boolean)}
                  />
                  <label htmlFor="headaches" className="flex-1 cursor-pointer">
                    Headaches
                  </label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-xl border border-border">
                  <Checkbox
                    id="cramps"
                    checked={cramps}
                    onCheckedChange={(checked) => setCramps(checked as boolean)}
                  />
                  <label htmlFor="cramps" className="flex-1 cursor-pointer">
                    Cramps
                  </label>
                </div>
              </div>
            </div>

            {/* Libido */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Libido</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'normal', 'high'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setLibido(option)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${
                      libido === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
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
                i === 7 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
