import React from 'react';

interface AnuToolsLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'light' | 'dark' | 'auto';
}

export const AnuToolsLogo: React.FC<AnuToolsLogoProps> = ({
  className = '',
  size = '100%',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Crisp drop shadow / accents if needed */}
      </defs>

      {/* Group scaled and centered */}
      <g transform="translate(4, 2)">
        {/* Big stylized 'A' */}
        {/* Left leg of A */}
        <polygon
          points="62,10 78,10 32,140 12,140"
          fill="#111827"
        />
        {/* Right leg of A */}
        <polygon
          points="62,10 78,10 126,140 106,140"
          fill="#111827"
        />

        {/* Dynamic Green Orbit / Swoosh looping through the 'A' */}
        <path
          d="M 2 92 C 10 110, 80 116, 134 94 C 158 84, 156 64, 132 60 C 100 55, 34 68, 28 84"
          fill="none"
          stroke="#00a651"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'NU' next to the right leg of A */}
        <text
          x="126"
          y="138"
          fill="#111827"
          fontFamily="Impact, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="54"
          letterSpacing="1"
        >
          NU
        </text>

        {/* 'TOOLS' in heavy bold italic below A and NU */}
        <text
          x="4"
          y="186"
          fill="#111827"
          fontFamily="Impact, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="48"
          letterSpacing="4"
        >
          TOOLS
        </text>
      </g>
    </svg>
  );
};
