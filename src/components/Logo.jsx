import React from 'react';

export default function Logo({
  size = 'md',
  showText = false,
  animated = true,
  isSyncing = false,
  className = '',
  onClick,
}) {
  const sizeMap = {
    xs: { box: 'w-6 h-6', px: 24, text: 'text-sm', badge: 'text-[10px]' },
    sm: { box: 'w-8 h-8', px: 32, text: 'text-base', badge: 'text-xs' },
    md: { box: 'w-10 h-10', px: 40, text: 'text-lg', badge: 'text-xs' },
    lg: { box: 'w-14 h-14', px: 56, text: 'text-xl', badge: 'text-xs' },
    xl: { box: 'w-20 h-20', px: 80, text: 'text-2xl', badge: 'text-sm' },
    hero: { box: 'w-24 h-24', px: 96, text: 'text-3xl', badge: 'text-sm' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2.5 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* Icon Badge */}
      <div
        className={`relative ${s.box} rounded-2xl shrink-0 flex items-center justify-center p-[2px] transition-all duration-300 ${
          animated ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        {/* Ambient Glowing Aura */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 opacity-60 blur-md transition-all duration-500 ${
            isSyncing
              ? 'animate-spin opacity-90 blur-lg'
              : animated
              ? 'animate-pulse-glow group-hover:opacity-100 group-hover:blur-lg'
              : 'opacity-40'
          }`}
        />

        {/* Squircle Glass Frame with Metallic Rim */}
        <div className="relative w-full h-full rounded-[14px] bg-[#070b14] border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Subtle Carbon Fiber / Mesh Ambient Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.25),transparent_70%)] pointer-events-none" />

          {/* Precision Automotive Logo SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full p-1.5 drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoChromeD" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              <linearGradient id="logoNeonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Speedometer Gauge Arc */}
            <path
              d="M 30 68 A 22 22 0 1 1 70 68"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 30 68 A 22 22 0 1 1 66 34"
              stroke="url(#logoNeonCyan)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#logoGlow)"
              className={animated ? 'animate-pulse' : ''}
            />

            {/* Gauge Ticks */}
            <line x1="50" y1="28" x2="50" y2="33" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="37" y1="35" x2="40" y2="38" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="63" y1="35" x2="60" y2="38" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

            {/* Titanium Aerodynamic 'D' Monogram */}
            <path
              d="M 26 24 L 50 24 C 69 24 80 36 80 52 C 80 68 68 80 48 80 L 26 80 Z"
              stroke="url(#logoChromeD)"
              strokeWidth="8"
              strokeLinejoin="round"
            />

            {/* Supercar Aero Flow Streak */}
            <path
              d="M 22 72 C 34 68, 48 56, 62 55 C 74 54, 84 63, 88 70"
              stroke="url(#logoNeonCyan)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#logoGlow)"
            />

            {/* Speed Needle */}
            <line
              x1="50"
              y1="52"
              x2="66"
              y2="36"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="52" r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />

            {/* Laser Flare Glint */}
            <circle cx="62" cy="55" r="2" fill="#ffffff" filter="url(#logoGlow)" />
          </svg>

          {/* Diagonal Glass Specular Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span
              className={`${s.text} font-black tracking-tight text-white uppercase font-mono group-hover:text-blue-200 transition-colors flex items-center`}
            >
              Debet
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 font-mono">
                .auto
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 font-mono text-[11px] font-bold border border-white/10 shadow-inner">
              ₴ UAH
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase hidden sm:block">
            Взаиморасчеты &bull; Склад
          </span>
        </div>
      )}
    </div>
  );
}
