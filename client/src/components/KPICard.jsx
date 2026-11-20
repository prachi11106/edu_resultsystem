import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, variant = 'surface', onClick }) => {
  const variantMap = {
    surface: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-[#00264D]/10 dark:bg-white/10 text-[#00264D] dark:text-[#FF7F00]',
      textPrimary: 'text-slate-900 dark:text-white',
    },
    positive: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-emerald-200 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      textPrimary: 'text-slate-900 dark:text-white',
    },
    analytics: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-[#00264D] text-white',
      textPrimary: 'text-[#00264D] dark:text-[#FF7F00]',
    },
    ai: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-orange-200 dark:border-orange-900/40',
      iconBg: 'bg-[#FF7F00]/15 dark:bg-[#FF7F00]/20 text-[#FF7F00]',
      textPrimary: 'text-slate-900 dark:text-white',
    },
  };

  const scheme = variantMap[variant] || variantMap.surface;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${scheme.bg} ${scheme.border} p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#FF7F00] hover:ring-2 hover:ring-[#FF7F00]/20' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg} shadow-2xs`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className={`font-heading font-extrabold text-2xl sm:text-3xl ${scheme.textPrimary}`}>
          {value}
        </h3>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
