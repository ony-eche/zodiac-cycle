import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown, Loader2 } from 'lucide-react';
import { loadLanguage } from '../../lib/i18n';

const CORE_LANGS = ['en', 'fr', 'de', 'es', 'pt'];

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', native: 'Polski' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', native: 'Svenska' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', native: 'Suomi' },
  { code: 'nb', name: 'Norwegian', flag: '🇳🇴', native: 'Norsk' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', native: 'Українська' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', native: 'Bahasa Melayu' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', native: 'ภาษาไทย' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', native: 'Română' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', native: 'Magyar' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', native: 'Čeština' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', native: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', native: 'עברית' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', native: 'فارسی' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', native: 'اردو' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', native: 'Kiswahili' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', native: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', native: 'Igbo' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', native: 'Hausa' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', native: 'አማርኛ' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', native: 'isiZulu' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', native: 'Afrikaans' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', native: 'Filipino' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
  { code: 'my', name: 'Burmese', flag: '🇲🇲', native: 'မြန်မာဘာသာ' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', native: 'ភាសាខ្មែរ' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪', native: 'ქართული' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', native: 'Azərbaycan' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿', native: 'Қазақша' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿', native: "O'zbek" },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲', native: 'Հայերեն' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', native: 'नेपाली' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳', native: 'Монгол' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱', native: 'Shqip' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦', native: 'Bosanski' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', native: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸', native: 'Српски' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', native: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮', native: 'Slovenščina' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', native: 'Български' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', native: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', native: 'Latviešu' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', native: 'Eesti' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸', native: 'Íslenska' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', native: 'Cymraeg' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪', native: 'Gaeilge' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸', native: 'Euskera' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸', native: 'Català' },
];

interface Props {
  variant?: 'icon' | 'full';
}

export function LanguageSelector({ variant = 'icon' }: Props) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language.split('-')[0]) || LANGUAGES[0];

  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (code: string) => {
    setOpen(false);
    setSearch('');

    // Core languages switch instantly
    if (CORE_LANGS.includes(code)) {
      i18n.changeLanguage(code);
      localStorage.setItem('zodiac_language', code);
      return;
    }

    // Non-core — load AI translation first
    setLoading(code);
    try {
      await loadLanguage(code);
      i18n.changeLanguage(code);
      localStorage.setItem('zodiac_language', code);
    } catch {
      // Fallback to English
      i18n.changeLanguage('en');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-border mx-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-semibold">Translating app...</p>
              <p className="text-sm text-muted-foreground mt-1">
                This only happens once. The translation will be saved locally.
              </p>
            </div>
          </div>
        </div>
      )}

      {variant === 'icon' ? (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 border border-border/50 hover:bg-card transition-colors text-sm"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-base">{current.flag}</span>
          <span className="text-muted-foreground text-xs font-medium uppercase">{current.code}</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">{t('profile.language')}</p>
              <p className="text-xs text-muted-foreground">{current.flag} {current.native}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && (
        <div
          className="fixed z-[100] bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
style={{
  width: '280px',
  maxHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}}
        >
          <div className="p-3 border-b border-border">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-input-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Core languages section */}
            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-accent/10">
              ⚡ Instant
            </div>
            {filtered.filter(l => CORE_LANGS.includes(l.code)).map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/20 transition-colors text-left ${current.code === lang.code ? 'bg-primary/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <p className="text-sm font-medium">{lang.native}</p>
                    <p className="text-xs text-muted-foreground">{lang.name}</p>
                  </div>
                </div>
                {current.code === lang.code && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            ))}

            {/* AI languages section */}
            {filtered.filter(l => !CORE_LANGS.includes(l.code)).length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-accent/10">
                  🤖 AI Translated (saved locally)
                </div>
                {filtered.filter(l => !CORE_LANGS.includes(l.code)).map(lang => {
                  const isCached = !!localStorage.getItem(`zodiac_translation_${lang.code}`);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/20 transition-colors text-left ${current.code === lang.code ? 'bg-primary/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <p className="text-sm font-medium">{lang.native}</p>
                          <p className="text-xs text-muted-foreground">
                            {lang.name} {isCached ? '· ✓ cached' : '· first use translates'}
                          </p>
                        </div>
                      </div>
                      {current.code === lang.code && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No languages found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 