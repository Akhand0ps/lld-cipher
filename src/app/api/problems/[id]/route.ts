import { NextRequest, NextResponse } from "next/server";
import { problemRepository } from "@/domain/repositories/ProblemRepository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await problemRepository.findById(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, error: "Problem not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
