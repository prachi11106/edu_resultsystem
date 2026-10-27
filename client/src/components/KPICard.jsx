import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, variant = 'surface' }) => {
  const variantMap = {
    surface: {
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#F5CBCB]/40',
      iconBg: 'bg-[#FBEFEF] text-[#332F35]',
      textPrimary: 'text-[#332F35]',
    },
    positive: {
      bg: 'bg-[#FFE2E2]',
      border: 'border-[#F5CBCB]',
      iconBg: 'bg-[#F5CBCB] text-[#332F35]',
      textPrimary: 'text-[#332F35]',
    },
    analytics: {
      bg: 'bg-[#F5CBCB]',
      border: 'border-[#FFE2E2]',
      iconBg: 'bg-[#FFFFFF] text-[#332F35]',
      textPrimary: 'text-[#332F35]',
    },
    ai: {
      bg: 'bg-[#C5B3D3]',
      border: 'border-white/50',
      iconBg: 'bg-[#FFFFFF] text-[#332F35]',
      textPrimary: 'text-[#332F35]',
    },
  };

  const scheme = variantMap[variant] || variantMap.surface;

  return (
    <div className={`${scheme.bg} ${scheme.border} p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#625B64]">
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
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-[#F5CBCB] text-[#332F35]'
                : 'bg-[#FFE2E2] text-[#332F35]'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[#625B64] font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
