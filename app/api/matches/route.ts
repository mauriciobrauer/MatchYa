import { NextRequest, NextResponse } from 'next/server';
import { getMatches, createMatch } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener tournamentId de query params si existe
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId') || undefined;
    
    const matches = await getMatches(tournamentId);
    return NextResponse.json(matches || []);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      status,
      player1,
      player2,
      score1,
      score2,
      sets,
      photoUrl,
      tournamentId,
    } = body;

    if (!date || !time || !status || !player1 || !player2) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const match = await createMatch({
      date,
      rawDate: date,
      time,
      status,
      player1,
      player2,
      score1,
      score2,
      sets,
      photoUrl,
      tournamentId,
    });

    return NextResponse.json({ success: true, id: match.id });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
