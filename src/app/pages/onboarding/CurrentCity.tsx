import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MapPin, Info, Loader2 } from 'lucide-react';
import { detectCurrency } from '../../../lib/currency';
import { useTranslation } from 'react-i18next';

interface LocationResult {
  name: string;
  country: string;
  country_code: string;
  admin1: string;
  latitude: number;
  longitude: number;
}

async function searchLocations(query: string): Promise<LocationResult[]> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.results?.length > 0) return data.results;
    throw new Error('No results');
  } catch {
    try {
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'ZodiacCycle/1.0' } }
      );
      const data2 = await res2.json();
      return data2.map((r: any) => ({
        name: r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0],
        country: r.address?.country || r.display_name.split(',').slice(-1)[0].trim(),
        country_code: r.address?.country_code?.toUpperCase() || '',
        admin1: r.address?.state || r.display_name.split(',')[1]?.trim() || '',
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }));
    } catch {
      return [];
    }
  }
}

export function CurrentCity() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    detectCurrency()
      .then(currency => updateUserData({ country_code: currency.country, currency: currency.code }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (city.length < 2) {
      setShowResults(false);
      setResults([]);
      return;
    }
    // Don't search if text matches currently selected location
    if (selected) {
      const selectedText = `${selected.name}, ${selected.admin1 ? selected.admin1 + ', ' : ''}${selected.country}`;
      if (city === selectedText) return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const found = await searchLocations(city);
      setResults(found);
      setShowResults(true);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [city]); // only depend on city, not selected

  const handleSelect = (location: LocationResult) => {
    setSelected(location);
    setCity(`${location.name}, ${location.admin1 ? location.admin1 + ', ' : ''}${location.country}`);
    setShowResults(false);
    setResults([]);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserData({
        currentCity: city,
        current_lat: selected.latitude,
        current_lng: selected.longitude,
        country_code: selected.country_code || '',
      });
      navigate('/onboarding/calculating');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.currentCity.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.currentCity.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-xl">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              {t('onboarding.currentCity.subtitle')}
            </div>
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="city" className="text-sm text-muted-foreground">
              {t('profile.currentCity')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="city"
                type="text"
                placeholder={t('onboarding.birthPlace.placeholder')}
                value={city}
                onChange={e => { setCity(e.target.value); setSelected(null); }}
                className="bg-input-background border-border rounded-xl pl-12 pr-10 py-6 text-lg"
                autoFocus
                autoComplete="off"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>

            {showResults && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {results.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-accent/20 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showResults && results.length === 0 && !loading && city.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-muted-foreground text-sm">
                No cities found.
              </div>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl"
          >
            {t('onboarding.next')}
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 9 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
} 