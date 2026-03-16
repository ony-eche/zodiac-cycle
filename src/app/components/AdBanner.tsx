import { useEffect, useRef } from 'react';
import { useUserData } from '../context/UserDataContext';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

// Placeholder shown while AdSense is pending approval
function AdPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`w-full rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'rgba(192,132,252,0.05)', border: '1px dashed rgba(192,132,252,0.2)' }}>
      <div className="flex items-center justify-center py-4 gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/30"/>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Advertisement</p>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/30"/>
      </div>
    </div>
  );
}

export function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const { userData } = useUserData();
  const adRef = useRef<HTMLDivElement>(null);
  const client = import.meta.env.VITE_ADSENSE_CLIENT;

  // Don't show ads to premium users
  if (userData.hasPaid) return null;

  // If no AdSense client configured yet, show placeholder
  if (!client || client === 'ca-pub-XXXXXXXXXX') {
    return <AdPlaceholder className={className}/>;
  }

  return (
    <div ref={adRef} className={`w-full overflow-hidden rounded-2xl ${className}`}>
      <p className="text-[9px] text-muted-foreground/40 text-center mb-1 uppercase tracking-widest">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}