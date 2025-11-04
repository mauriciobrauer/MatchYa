import { NextRequest, NextResponse } from 'next/server';
import { updateMatch, deleteMatch } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      rawDate,
    } = body;

    await updateMatch(params.id, {
      date,
      rawDate: rawDate || date,
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

    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMatch(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
