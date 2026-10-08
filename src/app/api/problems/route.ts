import { NextResponse } from "next/server";
import { problemRepository } from "@/domain/repositories/ProblemRepository";

export async function GET() {
  try {
    const problems = await problemRepository.findAll();
    return NextResponse.json({ success: true, data: problems });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
