import React from "react";
import { CipherSchoolsLogo } from "./CipherSchoolsLogo";

interface ArchitecturalPlaqueProps {
  className?: string;
}

/**
 * Architectural Stone Pediment Plaque
 * Recreates the classical stone frieze tablet with stepped beveled mouldings,
 * recessed carved field, and the official CipherSchools logo.
 */
export const ArchitecturalPlaque: React.FC<ArchitecturalPlaqueProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative mx-auto select-none transition-all duration-300 hover:translate-y-[-1px] ${className}`}
    >
      {/* Classical Stone Pediment Moulding Container */}
      <div className="relative rounded-2xl p-[3px] sm:p-[4px] bg-gradient-to-b from-[#fbf9f6] via-[#eae4d9] to-[#dcd4c6] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_38px_-10px_rgba(45,35,25,0.14),0_4px_12px_rgba(45,35,25,0.06)]">
        {/* Outer Stepped Bevel Layer */}
        <div className="rounded-[13px] sm:rounded-[14px] p-[2.5px] sm:p-[3.5px] bg-[#f5f0e6] border border-[#d6cec0] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_-1px_0_rgba(0,0,0,0.06)_inset]">
          {/* Middle Architectural Cornice Layer */}
          <div className="rounded-[11px] sm:rounded-[12px] p-[2px] sm:p-[3px] bg-gradient-to-b from-[#ece5d8] to-[#ded5c5] border border-[#c8bead]">
            {/* Inner Recessed Carved Stone Tablet Field */}
            <div className="rounded-[9px] sm:rounded-[10px] bg-gradient-to-b from-[#f7f2ea] to-[#efe9dd] px-6 sm:px-10 py-3.5 sm:py-5 border border-[#ede6da] shadow-[inset_0_2px_4px_rgba(45,35,25,0.06),inset_0_-1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
              {/* Official CipherSchools SVG Logo matching original brand identity */}
              <CipherSchoolsLogo className="h-7 xs:h-8 sm:h-9 md:h-10 w-auto max-w-[210px] xs:max-w-[240px] sm:max-w-[280px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] filter transition-transform hover:scale-[1.02]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
