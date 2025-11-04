import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs - These will need to be set as environment variables
const TOURNAMENTS_DB_ID = process.env.NOTION_TOURNAMENTS_DB_ID || '';
const PLAYERS_DB_ID = process.env.NOTION_PLAYERS_DB_ID || '';
const MATCHES_DB_ID = process.env.NOTION_MATCHES_DB_ID || '';
const PREDICTIONS_DB_ID = process.env.NOTION_PREDICTIONS_DB_ID || '';
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB_ID || '';

export interface Player {
  name: string;
  club: string;
  photoUrl?: string; // URL de la foto del jugador
}

export interface Match {
  id: string;
  date: string; // Display date (e.g., "2 nov")
  rawDate?: string; // Raw date for form editing (ISO format)
  time: string;
  status: 'pendiente' | 'finalizado';
  player1: Player;
  player2: Player;
  score1?: number;
  score2?: number;
  photoUrl?: string;
  sets?: string; // e.g., "3 - 1"
  tournamentId?: string; // ID del torneo al que pertenece el partido
}

export interface Prediction {
  id: string;
  matchId: string;
  predictedWinner: 'player1' | 'player2';
  userName: string;
  isCorrect?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  link?: string;
  price?: number;
}

// Helper function to parse Notion properties
function parseMatchFromNotion(page: any): Match {
  const props = page.properties;
  
  // Get raw date for form handling
  const rawDate = props.date?.date?.start || '';
  // Format date for display
  const displayDate = rawDate ? new Date(rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
  
  return {
    id: page.id,
    date: displayDate,
    rawDate: rawDate, // Store raw date for form editing
    time: props.time?.rich_text?.[0]?.plain_text || '',
    status: props.status?.select?.name === 'Finalizado' ? 'finalizado' : 'pendiente',
    player1: {
      name: props.player1_name?.title?.[0]?.plain_text || '',
      club: props.player1_club?.rich_text?.[0]?.plain_text || '',
    },
    player2: {
      name: props.player2_name?.rich_text?.[0]?.plain_text || props.player2_name?.title?.[0]?.plain_text || '',
      club: props.player2_club?.rich_text?.[0]?.plain_text || '',
    },
    score1: props.score1?.number || undefined,
    score2: props.score2?.number || undefined,
    photoUrl: props.photo?.files?.[0]?.file?.url || props.photo?.files?.[0]?.external?.url || undefined,
    sets: props.sets?.rich_text?.[0]?.plain_text || undefined,
  };
}

function parseProductFromNotion(page: any): Product {
  const props = page.properties;
  
  return {
    id: page.id,
    name: props.name?.title?.[0]?.plain_text || '',
    description: props.description?.rich_text?.[0]?.plain_text || '',
    imageUrl: props.image?.files?.[0]?.file?.url || props.image?.files?.[0]?.external?.url || undefined,
    link: props.link?.url || undefined,
    price: props.price?.number || undefined,
  };
}

// Matches
export async function getMatches(): Promise<Match[]> {
  try {
    const response = await notion.databases.query({
      database_id: MATCHES_DB_ID,
      sorts: [
        { property: 'date', direction: 'descending' },
        { property: 'time', direction: 'descending' },
      ],
    });

    return response.results.map((page: any) => parseMatchFromNotion(page));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<string | null> {
  try {
    // Convert date string to ISO format for Notion
    const dateValue = match.date.includes('T') ? match.date.split('T')[0] : match.date;
    
    const properties: any = {
      date: {
        date: {
          start: dateValue,
        },
      },
      time: {
        rich_text: [{ text: { content: match.time } }],
      },
      status: {
        select: {
          name: match.status === 'finalizado' ? 'Finalizado' : 'Pendiente',
        },
      },
      player1_name: {
        title: [{ text: { content: match.player1.name } }],
      },
      player1_club: {
        rich_text: [{ text: { content: match.player1.club } }],
      },
      player2_name: {
        rich_text: [{ text: { content: match.player2.name } }],
      },
      player2_club: {
        rich_text: [{ text: { content: match.player2.club } }],
      },
    };

    if (match.score1 !== undefined) {
      properties.score1 = { number: match.score1 };
    }
    if (match.score2 !== undefined) {
      properties.score2 = { number: match.score2 };
    }
    if (match.sets) {
      properties.sets = { rich_text: [{ text: { content: match.sets } }] };
    }
    if (match.photoUrl) {
      properties.photo = { 
        files: [{ 
          type: 'external', 
          external: { url: match.photoUrl } 
        }] 
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: MATCHES_DB_ID },
      properties,
    });

    return response.id;
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
}

export async function updateMatch(id: string, match: Partial<Match>): Promise<boolean> {
  try {
    const properties: any = {};
    
    if (match.date) {
      const dateValue = match.date.includes('T') ? match.date.split('T')[0] : match.date;
      properties.date = { date: { start: dateValue } };
    }
    if (match.time) {
      properties.time = { rich_text: [{ text: { content: match.time } }] };
    }
    if (match.status) {
      properties.status = {
        select: {
          name: match.status === 'finalizado' ? 'Finalizado' : 'Pendiente',
        },
      };
    }
    if (match.player1) {
      properties.player1_name = { title: [{ text: { content: match.player1.name } }] };
      properties.player1_club = { rich_text: [{ text: { content: match.player1.club } }] };
    }
    if (match.player2) {
      properties.player2_name = { rich_text: [{ text: { content: match.player2.name } }] };
      properties.player2_club = { rich_text: [{ text: { content: match.player2.club } }] };
    }
    if (match.score1 !== undefined) {
      properties.score1 = { number: match.score1 };
    }
    if (match.score2 !== undefined) {
      properties.score2 = { number: match.score2 };
    }
    if (match.sets) {
      properties.sets = { rich_text: [{ text: { content: match.sets } }] };
    }
    if (match.photoUrl !== undefined) {
      if (match.photoUrl) {
        properties.photo = { 
          files: [{ 
            type: 'external', 
            external: { url: match.photoUrl } 
          }] 
        };
      } else {
        properties.photo = { files: [] };
      }
    }

    await notion.pages.update({
      page_id: id,
      properties,
    });

    return true;
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
}

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await notion.databases.query({
      database_id: PRODUCTS_DB_ID,
      sorts: [{ property: 'created_time', direction: 'descending' }],
    });

    return response.results.map((page: any) => parseProductFromNotion(page));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Predictions
export async function getPredictions(matchId?: string): Promise<Prediction[]> {
  try {
    const filter: any = matchId
      ? { property: 'matchId', rich_text: { equals: matchId } }
      : undefined;

    const response = await notion.databases.query({
      database_id: PREDICTIONS_DB_ID,
      filter,
      sorts: [{ property: 'created_time', direction: 'descending' }],
    });

    return response.results.map((page: any) => ({
      id: page.id,
      matchId: page.properties.matchId?.rich_text?.[0]?.plain_text || '',
      predictedWinner: page.properties.predictedWinner?.select?.name === 'player1' ? 'player1' : 'player2',
      userName: page.properties.userName?.title?.[0]?.plain_text || '',
      isCorrect: page.properties.isCorrect?.checkbox || undefined,
    }));
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}

export async function createPrediction(
  matchId: string,
  predictedWinner: 'player1' | 'player2',
  userName: string
): Promise<string | null> {
  try {
    const response = await notion.pages.create({
      parent: { database_id: PREDICTIONS_DB_ID },
      properties: {
        matchId: {
          rich_text: [{ text: { content: matchId } }],
        },
        predictedWinner: {
          select: {
            name: predictedWinner,
          },
        },
        userName: {
          title: [{ text: { content: userName } }],
        },
      },
    });

    return response.id;
  } catch (error) {
    console.error('Error creating prediction:', error);
    return null;
  }
}

// Get prediction ranking
export async function getPredictionRanking(): Promise<{ userName: string; correct: number; total: number }[]> {
  try {
    const predictions = await getPredictions();
    const matches = await getMatches();
    const finishedMatches = matches.filter(m => m.status === 'finalizado');

    // Calculate correct predictions
    const userStats: Record<string, { correct: number; total: number }> = {};

    predictions.forEach(pred => {
      if (!userStats[pred.userName]) {
        userStats[pred.userName] = { correct: 0, total: 0 };
      }

      const match = finishedMatches.find(m => m.id === pred.matchId);
      if (match && match.score1 !== undefined && match.score2 !== undefined) {
        userStats[pred.userName].total++;
        const actualWinner = match.score1 > match.score2 ? 'player1' : 'player2';
        if (pred.predictedWinner === actualWinner) {
          userStats[pred.userName].correct++;
        }
      }
    });

    return Object.entries(userStats)
      .map(([userName, stats]) => ({
        userName,
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => b.correct - a.correct);
  } catch (error) {
    console.error('Error getting prediction ranking:', error);
    return [];
  }
}
