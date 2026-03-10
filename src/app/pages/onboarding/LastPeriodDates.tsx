import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { CalendarIcon } from 'lucide-react';

export function LastPeriodDates() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleContinue = () => {
    if (startDate && endDate) {
      updateUserData({
        lastPeriodStart: new Date(startDate),
        lastPeriodEnd: new Date(endDate),
      });
      navigate('/onboarding/hormonal-tracking');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl">When was your last period?</h1>
          <p className="text-muted-foreground">
            Select the start and end dates
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-4">

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate('');
                    }
                  }}
                  max={today}
                  min="2000-01-01"
                  className="w-full pl-12 pr-4 py-4 text-lg bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={today}
                  min={startDate || '2000-01-01'}
                  disabled={!startDate}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {!startDate && (
                <p className="text-xs text-muted-foreground">Pick a start date first</p>
              )}
            </div>

          </div>

          <Button
            onClick={handleContinue}
            disabled={!startDate || !endDate}
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
                i === 6 ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}