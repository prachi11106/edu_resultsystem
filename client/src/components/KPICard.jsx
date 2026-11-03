import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, variant = 'surface', onClick }) => {
  const variantMap = {
    surface: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-[#00264D]/10 text-[#00264D]',
      textPrimary: 'text-slate-900',
    },
    positive: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      textPrimary: 'text-slate-900',
    },
    analytics: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-[#00264D] text-white',
      textPrimary: 'text-[#00264D]',
    },
    ai: {
      bg: 'bg-white',
      border: 'border-orange-200',
      iconBg: 'bg-[#FF7F00]/15 text-[#FF7F00]',
      textPrimary: 'text-slate-900',
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
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg} shadow-2xs`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className={`font-heading font-extrabold text-3xl ${scheme.textPrimary}`}>
          {value}
        </h3>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
