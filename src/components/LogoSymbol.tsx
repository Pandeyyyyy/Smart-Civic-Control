import React from 'react';

interface LogoSymbolProps {
  className?: string;
  size?: number | string;
  showAura?: boolean;
}

/**
 * Official Smart Civic Connect Symbol
 * STRICT SPECIFICATION:
 * - Symbol/icon only
 * - NEVER contains text or subtitle inside the graphic
 * - Renders the clean skyscrapers, streetlight with Wi-Fi signal arcs,
 *   curved road, and emerald/teal leaf cradle.
 */
export const LogoSymbol: React.FC<LogoSymbolProps> = ({
  className = '',
  size = 40,
  showAura = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showAura && (
        <div className="absolute inset-0 rounded-full bg-teal-500/15 blur-md -z-10 scale-125" />
      )}
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          <linearGradient id="symLeafLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E7490" />
            <stop offset="40%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#042F2E" />
          </linearGradient>

          <linearGradient id="symLeafRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#065F46" />
          </linearGradient>

          <linearGradient id="symTowerCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891B2" />
            <stop offset="35%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#115E59" />
          </linearGradient>

          <linearGradient id="symTowerCenterRightFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#042F2E" />
          </linearGradient>

          <linearGradient id="symTowerLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>

          <linearGradient id="symTowerRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          <linearGradient id="symSignalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        {/* BUILDINGS */}
        <g id="sym-buildings">
          <path d="M 152 230 L 176 210 L 176 310 L 152 300 Z" fill="#0284C7" opacity="0.85" />

          <path d="M 174 195 L 208 175 L 208 320 L 174 310 Z" fill="url(#symTowerLeftGrad)" />
          <rect x="184" y="205" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />
          <rect x="184" y="226" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />
          <rect x="184" y="247" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />
          <rect x="194" y="200" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />
          <rect x="194" y="221" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />
          <rect x="194" y="242" width="4" height="15" rx="1.5" fill="#FFFFFF" opacity="0.9" />

          <path d="M 248 70 L 216 112 L 216 335 L 248 335 Z" fill="url(#symTowerCenterGrad)" />
          <path d="M 248 70 L 280 112 L 280 335 L 248 335 Z" fill="url(#symTowerCenterRightFace)" />
          
          <rect x="224" y="160" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="234" y="160" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="224" y="180" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="234" y="180" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="224" y="200" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="234" y="200" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="224" y="220" width="6" height="11" rx="1" fill="#FFFFFF" />
          <rect x="234" y="220" width="6" height="11" rx="1" fill="#FFFFFF" />

          <path d="M 284 190 L 324 165 L 324 330 L 284 330 Z" fill="url(#symTowerRightGrad)" />
          <rect x="292" y="200" width="5" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="292" y="222" width="5" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="292" y="244" width="5" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="306" y="195" width="5" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="306" y="217" width="5" height="14" rx="1.5" fill="#FFFFFF" />
          <rect x="306" y="239" width="5" height="14" rx="1.5" fill="#FFFFFF" />
        </g>

        {/* STREETLAMP */}
        <g id="sym-streetlight">
          <path d="M 338 290 L 338 190 Q 338 170 354 170 L 366 170 Q 372 170 374 176 L 370 182 Q 366 186 356 184 L 350 184 Q 346 184 346 192 L 346 290 Z" fill="#0E7490" />
          <ellipse cx="362" cy="184" rx="10" ry="5.5" fill="#0D9488" />

          <path d="M 350 152 A 16 16 0 0 1 374 152" fill="none" stroke="url(#symSignalGrad)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 342 138 A 28 28 0 0 1 382 138" fill="none" stroke="url(#symSignalGrad)" strokeWidth="5" strokeLinecap="round" />
          <path d="M 334 124 A 40 40 0 0 1 390 124" fill="none" stroke="url(#symSignalGrad)" strokeWidth="5.5" strokeLinecap="round" />
        </g>

        {/* CRADLE AND ROAD */}
        <g id="sym-cradle">
          <path d="M 134 235 C 134 300 170 380 250 386 C 215 350 200 300 240 260 C 200 250 155 240 134 235 Z" fill="url(#symLeafLeftGrad)" />
          <path d="M 134 236 C 136 325 195 388 260 388 C 220 370 196 332 188 284 C 212 290 236 294 256 295 L 256 266 C 200 262 160 252 134 236 Z" fill="#0D5C56" />
          <path d="M 235 388 C 310 388 368 316 364 240 C 330 256 290 274 258 290 C 265 330 255 365 235 388 Z" fill="url(#symLeafRightGrad)" />
          <path d="M 134 235 C 134 330 205 388 260 388 C 325 388 366 325 366 240 C 340 260 295 285 245 285 C 190 285 155 255 134 235 Z" fill="url(#symLeafLeftGrad)" />
          <path d="M 245 285 C 298 285 342 258 366 240 C 366 320 322 388 260 388 C 248 388 238 386 230 382 C 255 355 260 318 245 285 Z" fill="url(#symLeafRightGrad)" />

          <path d="M 208 388 C 208 360 230 330 245 298 C 250 286 256 270 262 255 L 268 256 C 262 272 256 288 252 300 C 238 332 222 360 220 388 Z" fill="#FFFFFF" />
          <path d="M 188 380 C 190 350 222 320 240 288 C 245 278 250 265 254 255 L 262 256 C 258 267 252 280 247 291 C 228 324 202 352 198 384 Z" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
};
