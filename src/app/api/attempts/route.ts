import { NextRequest, NextResponse } from "next/server";
import { attemptRepository } from "@/domain/repositories/AttemptRepository";
import { Attempt } from "@/domain/models/Attempt";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problemId");
    const candidateId = searchParams.get("candidateId") || "default-learner";

    if (!problemId) {
      // Return all attempts by this candidate
      const attempts = await attemptRepository.listByCandidate(candidateId);
      return NextResponse.json({
        success: true,
        data: attempts.map((a) => a.toJSON()),
      });
    }

    let attempt = await attemptRepository.findByProblemAndCandidate(problemId, candidateId);

    if (!attempt) {
      attempt = new Attempt({
        id: `att_${problemId}_${candidateId}_${Date.now().toString(36)}`,
        problemId,
        candidateId,
      });
      await attemptRepository.save(attempt);
    }

    return NextResponse.json({
      success: true,
      data: attempt.toJSON(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
