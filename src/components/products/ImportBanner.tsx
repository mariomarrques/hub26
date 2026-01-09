import cssLogo from "@/assets/css-logo-banner.png";

export const ImportBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 md:p-6 shadow-lg animate-fade-in">
      {/* Chinese flag stars as subtle background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 300 150" className="absolute right-8 top-1/2 -translate-y-1/2 h-28 w-36 text-red-600">
          <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.5" />
          <circle cx="85" cy="25" r="8" fill="currentColor" opacity="0.4" />
          <circle cx="100" cy="45" r="8" fill="currentColor" opacity="0.4" />
          <circle cx="100" cy="70" r="8" fill="currentColor" opacity="0.4" />
          <circle cx="85" cy="85" r="8" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white md:text-xl lg:text-2xl leading-tight">
          Os produtos abaixo são importados
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          diretamente da China
        </h2>
        
        <img 
          src={cssLogo} 
          alt="CSS Logo" 
          className="h-12 w-auto md:h-14 lg:h-16 flex-shrink-0"
        />
      </div>
    </div>
  );
};
