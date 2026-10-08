import { Suspense } from "react";
import { ProblemStudioWorkspace } from "@/components/ProblemStudioWorkspace";
import { SEED_PROBLEMS } from "@/domain/repositories/ProblemRepository";

export function generateStaticParams() {
  return SEED_PROBLEMS.map((p) => ({
    id: p.id,
  }));
}

async function ProblemStudioWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProblemStudioWorkspace problemId={id} />;
}

export default function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#faf8f5] text-[#57534e]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-[#1c1917] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Loading workspace...</span>
          </div>
        </div>
      }
    >
      <ProblemStudioWrapper params={params} />
    </Suspense>
  );
}
