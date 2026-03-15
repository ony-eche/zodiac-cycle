import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { getNatalChartFromAPI } from '../../../lib/prokerala';
import { getNatalChart } from '../../../lib/astrology';
import { useTranslation } from 'react-i18next';

export function Calculating() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUserData();
  const { t } = useTranslation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function calculate() {
      const birthDate = userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date();
      const birthTime = userData.timeOfBirth || 'unknown';
      const lat = userData.birth_lat || 0;
      const lng = userData.birth_lng || 0;

      try {
        const chart = await getNatalChartFromAPI(birthDate, birthTime, lat, lng);
        updateUserData({
          sun_sign: chart.sun, moon_sign: chart.moon, rising_sign: chart.rising,
          venus_sign: chart.venus, mars_sign: chart.mars, mercury_sign: chart.mercury,
          jupiter_sign: chart.jupiter, saturn_sign: chart.saturn, houses: chart.houses,
        });
      } catch (err) {
        const chart = getNatalChart(birthDate, birthTime, lat, lng);
        updateUserData({
          sun_sign: chart.sun, moon_sign: chart.moon, rising_sign: chart.rising,
          venus_sign: chart.venus, mars_sign: chart.mars, mercury_sign: chart.mercury,
          houses: chart.houses,
        });
      }

      setTimeout(() => navigate('/onboarding/paywall'), 1500);
    }

    calculate();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6">
        <div className="text-6xl animate-pulse">✦</div>
        <h2 className="text-2xl font-medium">{t('onboarding.calculating.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('onboarding.calculating.subtitle')}</p>
        <div className="flex justify-center gap-2 mt-4">
          {['☀️', '🌙', '⬆️', '♀️', '♂️', '☿'].map((planet, i) => (
            <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
              {planet}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
