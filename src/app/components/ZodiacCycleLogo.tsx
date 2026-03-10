export function ZodiacCycleLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Moon crescent */}
        <path 
          d="M20 4C11.7157 4 5 10.7157 5 19C5 27.2843 11.7157 34 20 34C22.2091 34 24.3072 33.5308 26.2 32.6889C22.4183 30.6889 20 26.6889 20 22C20 17.3111 22.4183 13.3111 26.2 11.3111C24.3072 10.4692 22.2091 10 20 10C15.0294 10 11 14.0294 11 19C11 23.9706 15.0294 28 20 28" 
          stroke="#c084fc" 
          strokeWidth="2" 
          fill="#fbbfd4"
          fillOpacity="0.3"
        />
        
        {/* Stars/constellation dots */}
        <circle cx="28" cy="8" r="1.5" fill="#c084fc" />
        <circle cx="32" cy="12" r="1" fill="#fbbfd4" />
        <circle cx="34" cy="18" r="1.5" fill="#c084fc" />
        <circle cx="32" cy="24" r="1" fill="#fbbfd4" />
        
        {/* Period cycle indicator (small dots forming a circle) */}
        <circle cx="13" cy="19" r="1.5" fill="#c084fc" opacity="0.4" />
        <circle cx="20" cy="16" r="1.5" fill="#c084fc" opacity="0.7" />
        <circle cx="20" cy="22" r="1.5" fill="#c084fc" opacity="1" />
      </svg>
      <span className="text-2xl tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        ZodiacCycle
      </span>
    </div>
  );
}
