import React from "react";

interface CipherSchoolsLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Official CipherSchools Logo Component
 * Matches the authentic brand identity: circular dark emblem with vibrant orange 'C'
 * and white terminal cursor mark, paired with the bold 'CipherSchools' wordmark.
 */
export const CipherSchoolsLogo: React.FC<CipherSchoolsLogoProps> = ({
  className = "h-9 w-auto",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 350 70"
      className={className}
      role="img"
      aria-label="CipherSchools"
      {...props}
    >
      {/* Official CipherSchools Circular Badge Icon */}
      <g transform="translate(6, 6)">
        {/* Dark Circular Base */}
        <circle cx="29" cy="29" r="28" fill="#202428" />

        {/* Outer subtle ring border */}
        <circle
          cx="29"
          cy="29"
          r="27.5"
          fill="none"
          stroke="#2a2e34"
          strokeWidth="1"
        />

        {/* Vibrant Orange Stylized 'C' Arc */}
        <path
          d="M 29 9 C 18 9 9 18 9 29 C 9 40 18 49 29 49 C 37.2 49 44.2 44.1 47.4 37.1 L 39.4 33.7 C 37.6 37.4 33.6 40 29 40 C 22.9 40 18 35.1 18 29 C 18 22.9 22.9 18 29 18 C 33.6 18 37.6 20.6 39.4 24.3 L 47.4 20.9 C 44.2 13.9 37.2 9 29 9 Z"
          fill="#F37021"
        />

        {/* White Terminal / Inner Mark inside opening */}
        <path
          d="M 40.5 23 L 45 23 C 48 26 48.5 32 45 35 L 40.5 35 L 42 29 Z"
          fill="#FFFFFF"
        />
        <circle cx="43.5" cy="29" r="2" fill="#202428" />
      </g>

      {/* Typography: CipherSchools in bold, modern sans-serif */}
      <text
        x="76"
        y="42"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="33"
        letterSpacing="-0.9"
        fill="#1c1917"
      >
        CipherSchools
      </text>
    </svg>
  );
};
