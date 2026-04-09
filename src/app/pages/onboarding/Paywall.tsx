import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../../context/UserDataContext';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Check, Sparkles, Loader2, X, Shield, Lock } from 'lucide-react';
import { detectCurrency, getCurrencyByCountry, type CurrencyInfo } from '../../../lib/currency';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../../lib/supabase';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const PRICE_ID_TRIAL   = import.meta.env.VITE_STRIPE_PRICE_ID_TRIAL;
const PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;

// ─── Payment Form ─────────────────────────────────────────────────────────────
function PaymentForm({ onSuccess, onCancel, currency }: {
  onSuccess: () => void;
  onCancel: () => void;
  currency: CurrencyInfo;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/payment-success` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="glass-heavy w-full max-w-lg rounded-t-3xl p-6 border-t border-white/40 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 rounded-full bg-border/50 mx-auto"/>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Complete Payment</h3>
            <p className="text-sm text-muted-foreground">
              {currency.symbol}{currency.trialPrice} {currency.code} · then {currency.symbol}{currency.monthlyPrice}/mo
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-xl">
            <X className="w-5 h-5 text-muted-foreground"/>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-emerald-500"/>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary"/>
            <span>Powered by Stripe</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass rounded-2xl p-4 border border-white/30 min-h-[120px]">
            {!ready && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary"/>
                <span className="text-sm text-muted-foreground">Loading payment methods...</span>
              </div>
            )}
            <PaymentElement
              onReady={() => setReady(true)}
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['apple_pay', 'google_pay', 'card'],
                wallets: {
                  applePay: 'auto',
                  googlePay: 'auto',
                },
              }}
            /> 
          </div>

          {error && (
            <div className="glass rounded-2xl p-3 border border-rose-300/50 bg-rose-50/50">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || loading || !ready}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold btn-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</>
              : <><Check className="w-5 h-5"/> Pay {currency.symbol}{currency.trialPrice} {currency.code}</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAYWALL ─────────────────────────────────────────────────────────────
export function Paywall() {
  const navigate = useNavigate();
  const { updateUserData, userData, syncToSupabase } = useUserData();
  const { t } = useTranslation();

  const [selected, setSelected] = useState<'trial' | 'monthly' | 'free' | null>(null);
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingCurrency(true);
      try {
        const c = userData.country_code
          ? getCurrencyByCountry(userData.country_code)
          : await detectCurrency();
        setCurrency(c);
        updateUserData({ country_code: c.country, currency: c.code });
      } catch {
        setCurrency({ code: 'USD', symbol: '$', country: 'US', trialPrice: '1', monthlyPrice: '5.99' });
      } finally {
        setLoadingCurrency(false);
      }
    };
    load();
  }, []);

  useEffect(() => { 
    const hideStripeBar = () => {
      const allIframes = document.querySelectorAll('iframe');
      allIframes.forEach(iframe => {
        if (iframe.src?.includes('stripe') && iframe.style?.position === 'fixed') {
          iframe.style.display = 'none';
        }
      });
    };
    hideStripeBar();
    const interval = setInterval(hideStripeBar, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGetAccess = async () => {
    if (selected === 'free') {
      updateUserData({ hasPaid: false });
      await syncToSupabase();
      // ✅ Go to signup page with Facebook and Google options
      navigate('/signup', { replace: true });
      return;
    }
    if (!selected || !currency) return;

    const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    setStripePromise(stripe);

    const priceId = selected === 'trial' ? PRICE_ID_TRIAL : PRICE_ID_MONTHLY;
    setLoadingIntent(true);

    try {
      const res = await fetch(`${WORKER_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: userData.email }),
      });
      const data = await res.json() as any;

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStripeCustomerId(data.customerId || null);
        setTimeout(() => setShowPaymentForm(true), 100);
      } else {
        alert(`Payment setup failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Could not connect to payment server. Please try again.');
    } finally {
      setLoadingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    updateUserData({
      hasPaid: true,
      currency: currency?.code,
      stripe_customer_id: stripeCustomerId ?? undefined,
    });
    setShowPaymentForm(false);
    
    // Sync to Supabase before redirect
    await syncToSupabase();
    
    // ✅ Always go to signup page with Facebook and Google options
    navigate('/signup', { replace: true });
  }; 

  const features = [
    t('paywall.features.chart'),
    t('paywall.features.transits'),
    t('paywall.features.cycle'),
    t('paywall.features.hormonal'),
    t('paywall.features.moon'),
    t('paywall.features.wellness'),
    t('paywall.features.unlimited'),
  ]; 

  const stripeAppearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#c084fc',
      colorBackground: '#ffffff',
      colorText: '#2d1b3d',
      colorDanger: '#d4183d',
      borderRadius: '12px',
    },
    rules: { '.Link': { display: 'none' } },
  }; 

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-4 pb-8">
        <ZodiacCycleLogo className="justify-center"/>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse"/>
            <h1 className="text-3xl">{t('paywall.title')}</h1>
            <Sparkles className="w-6 h-6 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }}/>
          </div>
          <p className="text-muted-foreground">{t('paywall.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {/* Trial plan */}
          <button
            onClick={() => setSelected('trial')}
            className={`w-full text-left glass rounded-3xl p-6 transition-all border-2 ${
              selected === 'trial' ? 'border-primary shadow-lg scale-[1.01]' : 'border-white/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gradient">{currency?.symbol}{currency?.trialPrice}</span>
                  <span className="text-muted-foreground text-sm">{currency?.code}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('paywall.trial')} · {t('paywall.then', { price: `${currency?.symbol}${currency?.monthlyPrice}` })}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">BEST VALUE</span>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary"/> {f}
                </div>
              ))}
            </div>
          </button>

          {/* Monthly plan */}
          <button
            onClick={() => setSelected('monthly')}
            className={`w-full text-left glass rounded-3xl p-5 transition-all border-2 ${
              selected === 'monthly' ? 'border-primary' : 'border-white/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{currency?.symbol}{currency?.monthlyPrice}</span>
                <span className="text-xs text-muted-foreground ml-2">{currency?.code}/month</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${selected === 'monthly' ? 'bg-primary border-primary' : 'border-border'}`} />
            </div>
          </button>

          {/* Free plan */}
          <button
            onClick={() => setSelected('free')}
            className={`w-full text-left glass rounded-3xl p-5 transition-all border-2 ${
              selected === 'free' ? 'border-primary' : 'border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{t('paywall.free')}</p>
                <p className="text-sm text-muted-foreground">{t('paywall.freeDesc')}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${selected === 'free' ? 'bg-primary border-primary' : 'border-border'}`} />
            </div>
          </button>
        </div>

        <Button
          onClick={handleGetAccess}
          disabled={!selected || loadingCurrency || loadingIntent}
          className="w-full bg-gradient-to-r from-primary to-secondary py-4 rounded-2xl text-lg font-bold btn-glow"
        >
          {loadingIntent ? <Loader2 className="animate-spin mr-2"/> : (selected === 'trial' ? t('paywall.cta') : 'Continue ✦')}
        </Button>
      </div>

      {showPaymentForm && clientSecret && currency && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
          <PaymentForm
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        </Elements>
      )}
    </div>
  );
}