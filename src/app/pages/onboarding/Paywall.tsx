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

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No hidden fees. Your data is always private.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAYWALL ─────────────────────────────────────────────────────────────
export function Paywall() {
  const navigate = useNavigate();
  const { updateUserData, userData } = useUserData();
  const { t } = useTranslation();

  const [selected, setSelected] = useState<'trial' | 'monthly' | 'free' | null>(null);
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  // Currency detection — runs once on mount
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
  // Add this at the top of the Paywall component, after the state declarations
useEffect(() => { 
  // Hide Stripe test toolbar that blocks UI
  const hideStripeBar = () => {
    const bars = document.querySelectorAll('[data-testid="stripe-badge"], .StripeElement, iframe[name*="stripe"]');
    // Target the floating Stripe dev toolbar specifically
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
    navigate('/dashboard');
    return;
  }
  if (!selected || !currency) return;

  // Load Stripe immediately and store the PROMISE directly
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
      // Small delay to ensure stripePromise state is set before showing form
      setTimeout(() => setShowPaymentForm(true), 100);
    } else {
      console.error('Stripe error:', JSON.stringify(data));
      alert(`Payment setup failed: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Payment intent failed:', err);
    alert('Could not connect to payment server. Please try again.');
  } finally {
    setLoadingIntent(false);
  }
};
  const handlePaymentSuccess = () => {
    updateUserData({
      hasPaid: true,
      currency: currency?.code,
      stripe_customer_id: stripeCustomerId ?? undefined,
    });
    setShowPaymentForm(false);
    navigate('/dashboard');
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
  rules: {
    '.Link': { display: 'none' },
  },
}; 
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-4 pb-8">
        <ZodiacCycleLogo className="justify-center"/>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary float-sparkle"/>
            <h1 className="text-3xl">{t('paywall.title')}</h1>
            <Sparkles className="w-6 h-6 text-secondary float-sparkle" style={{ animationDelay: '0.5s' }}/>
          </div>
          <p className="text-muted-foreground">{t('paywall.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {/* Trial plan */}
          <button
            onClick={() => setSelected('trial')}
            className={`w-full text-left glass glossy-hover rounded-3xl p-6 transition-all border-2 ${
              selected === 'trial' ? 'border-primary shadow-lg scale-[1.01]' : 'border-white/30 hover:border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-2">
                  {loadingCurrency ? <Loader2 className="w-5 h-5 animate-spin text-primary"/> : (
                    <>
                      <span className="text-4xl font-bold text-gradient">{currency?.symbol}{currency?.trialPrice}</span>
                      <span className="text-muted-foreground text-sm">{currency?.code}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('paywall.trial')} · {t('paywall.then', { price: `${currency?.symbol}${currency?.monthlyPrice}` })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">BEST VALUE</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === 'trial' ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selected === 'trial' && <div className="w-2 h-2 rounded-full bg-white"/>}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary"/>
                  </div>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Monthly plan */}
          <button
            onClick={() => setSelected('monthly')}
            className={`w-full text-left glass rounded-3xl p-5 transition-all border-2 ${
              selected === 'monthly' ? 'border-primary shadow-md' : 'border-white/30 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  {loadingCurrency ? <Loader2 className="w-4 h-4 animate-spin text-primary"/> : (
                    <>
                      <span className="text-2xl font-bold text-gradient">{currency?.symbol}{currency?.monthlyPrice}</span>
                      <span className="text-xs text-muted-foreground">{currency?.code}/month</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly · Full access · No trial</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'monthly' ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {selected === 'monthly' && <div className="w-2 h-2 rounded-full bg-white"/>}
              </div>
            </div>
          </button>

          {/* Free plan */}
          <button
            onClick={() => setSelected('free')}
            className={`w-full text-left glass rounded-3xl p-5 transition-all border-2 ${
              selected === 'free' ? 'border-primary shadow-md' : 'border-white/20 hover:border-primary/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{t('paywall.free')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('paywall.freeDesc')}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'free' ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {selected === 'free' && <div className="w-2 h-2 rounded-full bg-white"/>}
              </div>
            </div>
          </button>
        </div>

        {(selected === 'trial' || selected === 'monthly') && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Pay with:</span>
            {['🍎 Apple Pay', 'G Pay', '🅿 PayPal', '💳 Card'].map(m => (
              <span key={m} className="text-xs glass px-2.5 py-1 rounded-lg border border-white/30 font-medium">{m}</span>
            ))}
          </div>
        )}

        <Button
          onClick={handleGetAccess}
          disabled={!selected || loadingCurrency || loadingIntent}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-4 rounded-2xl text-lg font-bold btn-glow disabled:opacity-40"
        >
          {loadingIntent
            ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Setting up payment...</>
            : selected === 'trial'   ? t('paywall.cta')
            : selected === 'monthly' ? 'Subscribe Monthly ✦'
            : selected === 'free'    ? t('paywall.freeCta')
            : t('paywall.selectPlan')
          }
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">{t('paywall.disclaimer')}</p>
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