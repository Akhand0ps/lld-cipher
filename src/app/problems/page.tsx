"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProblemsView } from "@/components/ProblemsView";
import { Problem } from "@/domain/models/Problem";
import { SEED_PROBLEMS } from "@/domain/repositories/ProblemRepository";

export default function ProblemsCatalogPage() {
  const [problems, setProblems] = useState<Problem[]>(SEED_PROBLEMS);

  useEffect(() => {
    async function loadProblems() {
      try {
        const res = await fetch("/api/problems");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setProblems(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      }
    }
    loadProblems();
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[#faf8f5] text-[#1c1917] overflow-hidden font-sans">
      <Header problems={problems} />
      <ProblemsView problems={problems} />
    </div>
  );
}
