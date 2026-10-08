"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { LandingHero } from "@/components/LandingHero";
import { DocsDrawerModal } from "@/components/DocsDrawerModal";

export default function HomePage() {
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-[#faf8f5] text-[#1c1917] overflow-hidden font-sans">
      <Header onOpenDocs={() => setDocsOpen(true)} />
      <LandingHero onOpenDocs={() => setDocsOpen(true)} />
      <DocsDrawerModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
