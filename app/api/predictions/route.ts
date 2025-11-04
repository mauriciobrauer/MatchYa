import { NextRequest, NextResponse } from 'next/server';
import { createPrediction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, predictedWinner, userName } = body;

    if (!matchId || !predictedWinner || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prediction = await createPrediction({
      matchId,
      predictedWinner,
      userName,
    });

    return NextResponse.json({ success: true, id: prediction.id });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
