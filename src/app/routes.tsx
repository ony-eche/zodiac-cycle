import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

const Landing             = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const SignUp              = lazy(() => import('./pages/auth/SignUp').then(m => ({ default: m.SignUp })));
const Login               = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Welcome             = lazy(() => import('./pages/onboarding/Welcome').then(m => ({ default: m.Welcome })));
const BirthDate           = lazy(() => import('./pages/onboarding/BirthDate').then(m => ({ default: m.BirthDate })));
const BirthTime           = lazy(() => import('./pages/onboarding/BirthTime').then(m => ({ default: m.BirthTime })));
const BirthTimeInfo       = lazy(() => import('./pages/onboarding/BirthTimeInfo').then(m => ({ default: m.BirthTimeInfo })));
const BirthPlace          = lazy(() => import('./pages/onboarding/BirthPlace').then(m => ({ default: m.BirthPlace })));
const PeriodTracking      = lazy(() => import('./pages/onboarding/PeriodTracking').then(m => ({ default: m.PeriodTracking })));
const PeriodRegularity    = lazy(() => import('./pages/onboarding/PeriodRegularity').then(m => ({ default: m.PeriodRegularity })));
const LastPeriodKnowledge = lazy(() => import('./pages/onboarding/LastPeriodKnowledge').then(m => ({ default: m.LastPeriodKnowledge })));
const LastPeriodDates     = lazy(() => import('./pages/onboarding/LastPeriodDates').then(m => ({ default: m.LastPeriodDates })));
const HormonalTracking    = lazy(() => import('./pages/onboarding/HormonalTracking').then(m => ({ default: m.HormonalTracking })));
const Lifestyle           = lazy(() => import('./pages/onboarding/Lifestyle').then(m => ({ default: m.Lifestyle })));
const CurrentCity         = lazy(() => import('./pages/onboarding/CurrentCity').then(m => ({ default: m.CurrentCity })));
const Calculating         = lazy(() => import('./pages/onboarding/Calculating').then(m => ({ default: m.Calculating })));
const Paywall             = lazy(() => import('./pages/onboarding/Paywall').then(m => ({ default: m.Paywall })));
const Dashboard           = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-6xl">🌙</p>
        <h1 className="text-2xl font-bold text-primary">Page not found</h1>
        <a href="/" className="text-muted-foreground underline text-sm">Go home</a>
      </div>
    </div>
  );
} 
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/',                                 element: withSuspense(Landing) },
  { path: '/signup',                           element: withSuspense(SignUp) },
  { path: '/login',                            element: withSuspense(Login) },
  { path: '/onboarding/welcome',               element: withSuspense(Welcome) },
  { path: '/onboarding/birth-date',            element: withSuspense(BirthDate) },
  { path: '/onboarding/birth-time',            element: withSuspense(BirthTime) },
  { path: '/onboarding/birth-time-info',       element: withSuspense(BirthTimeInfo) },
  { path: '/onboarding/birth-place',           element: withSuspense(BirthPlace) },
  { path: '/onboarding/period-tracking',       element: withSuspense(PeriodTracking) },
  { path: '/onboarding/period-regularity',     element: withSuspense(PeriodRegularity) },
  { path: '/onboarding/last-period-knowledge', element: withSuspense(LastPeriodKnowledge) },
  { path: '/onboarding/last-period-dates',     element: withSuspense(LastPeriodDates) },
  { path: '/onboarding/hormonal-tracking',     element: withSuspense(HormonalTracking) },
  { path: '/onboarding/lifestyle',             element: withSuspense(Lifestyle) },
  { path: '/onboarding/current-city',          element: withSuspense(CurrentCity) },
  { path: '/onboarding/calculating',           element: withSuspense(Calculating) },
  { path: '/onboarding/paywall',               element: withSuspense(Paywall) },
  { path: '/dashboard',                        element: withSuspense(Dashboard) },
  { path: '*', element: <NotFound /> }
  ,{ path: '/reset-password', element: withSuspense(ResetPassword) }
]);
