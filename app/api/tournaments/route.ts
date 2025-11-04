import { NextRequest, NextResponse } from 'next/server';
import { getTournaments, createTournament } from '@/lib/db';

export async function GET() {
  try {
    const tournaments = await getTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dates, club1, club2, description } = body;

    if (!name || !dates || !club1 || !club2) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tournament = await createTournament({
      name,
      dates: Array.isArray(dates) ? dates : [dates],
      club1,
      club2,
      description,
    });

    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

