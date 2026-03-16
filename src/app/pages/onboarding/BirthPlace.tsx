import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LocationResult {
  name: string;
  country: string;
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
        admin1: r.address?.state || r.display_name.split(',')[1]?.trim() || '',
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }));
    } catch {
      return [];
    }
  }
}

export function BirthPlace() {
  const navigate = useNavigate();
  const { updateUserData } = useUserData();
  const { t } = useTranslation();
  const [place, setPlace] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (place.length < 2) {
      setShowResults(false);
      setResults([]);
      return;
    }
    // Don't search if this exact text matches what was selected
    if (selected) {
      const selectedText = `${selected.name}, ${selected.admin1 ? selected.admin1 + ', ' : ''}${selected.country}`;
      if (place === selectedText) return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const found = await searchLocations(place);
      setResults(found);
      setShowResults(true);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [place]); // only depend on place, not selected

  const handleSelect = (location: LocationResult) => {
    setSelected(location);
    setPlace(`${location.name}, ${location.admin1 ? location.admin1 + ', ' : ''}${location.country}`);
    setShowResults(false);
    setResults([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlace(e.target.value);
    setSelected(null);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserData({
        placeOfBirth: place,
        birth_lat: selected.latitude,
        birth_lng: selected.longitude,
      });
      navigate('/onboarding/period-tracking');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl">{t('onboarding.birthPlace.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.birthPlace.subtitle')}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2 relative">
            <label htmlFor="place" className="text-sm text-muted-foreground">
              {t('profile.birthPlace')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="place"
                type="text"
                placeholder={t('onboarding.birthPlace.placeholder')}
                value={place}
                onChange={handleChange}
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
                {results.map((result, index) => (
                  <button
                    key={index}
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

            {showResults && results.length === 0 && !loading && place.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-muted-foreground text-sm">
                No cities found. Try a different spelling.
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
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === 4 ? 'w-8 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
} 