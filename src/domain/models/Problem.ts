export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number; // e.g. 20 (sum = 100)
  description: string;
  benchmarkGuideline: string;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

export interface Problem {
  id: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  functionalRequirements: string[];
  nonFunctionalConstraints: string[];
  rubric: Rubric;
  starterTemplates?: {
    requirementsAnalysis?: string;
    classDesign?: string;
    relationshipsAndPatterns?: string;
  };
}
