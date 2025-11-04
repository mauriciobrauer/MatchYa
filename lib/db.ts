import { createClient } from '@libsql/client';

// Exportar tipos/interfaces
export interface Player {
  name: string;
  club: string;
  photoUrl?: string;
}

export interface Match {
  id: string;
  date: string;
  rawDate?: string;
  time: string;
  status: 'pendiente' | 'finalizado';
  player1: Player;
  player2: Player;
  score1?: number;
  score2?: number;
  photoUrl?: string;
  sets?: string;
  tournamentId?: string;
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

// Validar variables de entorno
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.warn('⚠️ TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no están configuradas');
}

// Crear cliente de Turso solo si las variables están configuradas
const client = tursoUrl && tursoToken
  ? createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
  : null;

// Helper para verificar que el cliente esté disponible
function ensureClient() {
  if (!client) {
    throw new Error('Turso client not initialized. Please configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.');
  }
  return client;
}

// ===== TOURNAMENTS =====

export interface Tournament {
  id: string;
  name: string;
  dates: string[]; // Array de fechas separadas por comas o JSON
  club1: string;
  club2: string;
  description?: string;
}

export async function getTournaments(): Promise<Tournament[]> {
  if (!client) {
    console.warn('Turso client not initialized');
    return [];
  }
  try {
    const db = ensureClient();
    const result = await db.execute('SELECT * FROM tournaments ORDER BY name');
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      dates: row.dates ? (row.dates.includes(',') ? row.dates.split(',').map((d: string) => d.trim()) : [row.dates]) : [],
      club1: row.club1,
      club2: row.club2,
      description: row.description || undefined,
    }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

export async function getTournament(id: string): Promise<Tournament | null> {
  if (!client) {
    console.warn('Turso client not initialized');
    return null;
  }
  try {
    const db = ensureClient();
    const result = await db.execute({
      sql: 'SELECT * FROM tournaments WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0] as any;
    return {
      id: row.id,
      name: row.name,
      dates: row.dates ? (row.dates.includes(',') ? row.dates.split(',').map((d: string) => d.trim()) : [row.dates]) : [],
      club1: row.club1,
      club2: row.club2,
      description: row.description || undefined,
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

export async function createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
  const db = ensureClient();
  const id = Date.now().toString();
  const datesStr = Array.isArray(tournament.dates) ? tournament.dates.join(',') : tournament.dates || '';
  
  await db.execute({
    sql: `INSERT INTO tournaments (id, name, dates, club1, club2, description) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, tournament.name, datesStr, tournament.club1, tournament.club2, tournament.description || null],
  });
  
  return { id, ...tournament };
}

export async function updateTournament(id: string, tournament: Partial<Omit<Tournament, 'id'>>): Promise<void> {
  const updates: string[] = [];
  const args: any[] = [];
  
  if (tournament.name !== undefined) {
    updates.push('name = ?');
    args.push(tournament.name);
  }
  if (tournament.dates !== undefined) {
    updates.push('dates = ?');
    args.push(Array.isArray(tournament.dates) ? tournament.dates.join(',') : tournament.dates);
  }
  if (tournament.club1 !== undefined) {
    updates.push('club1 = ?');
    args.push(tournament.club1);
  }
  if (tournament.club2 !== undefined) {
    updates.push('club2 = ?');
    args.push(tournament.club2);
  }
  if (tournament.description !== undefined) {
    updates.push('description = ?');
    args.push(tournament.description || null);
  }
  
  if (updates.length > 0) {
    const db = ensureClient();
    args.push(id);
    await db.execute({
      sql: `UPDATE tournaments SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }
}

export async function deleteTournament(id: string): Promise<void> {
  const db = ensureClient();
  await db.execute({
    sql: 'DELETE FROM tournaments WHERE id = ?',
    args: [id],
  });
}

// ===== MATCHES =====

export async function getMatches(tournamentId?: string): Promise<Match[]> {
  if (!client) {
    console.warn('Turso client not initialized');
    return [];
  }
  try {
    const db = ensureClient();
    let sql = 'SELECT * FROM matches';
    let args: any[] = [];
    
    if (tournamentId) {
      sql += ' WHERE tournament_id = ?';
      args.push(tournamentId);
    }
    
    sql += ' ORDER BY date, time';
    
    const result = await db.execute({ sql, args });
    
    return result.rows.map((row: any) => ({
      id: row.id,
      date: row.date,
      rawDate: row.raw_date || row.date,
      time: row.time,
      status: row.status as 'pendiente' | 'finalizado',
      player1: {
        name: row.player1_name,
        club: row.player1_club,
      },
      player2: {
        name: row.player2_name,
        club: row.player2_club,
      },
      score1: row.score1 !== null ? row.score1 : undefined,
      score2: row.score2 !== null ? row.score2 : undefined,
      sets: row.sets || undefined,
      photoUrl: row.photo_url || undefined,
      tournamentId: row.tournament_id || undefined,
    }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function getMatch(id: string): Promise<Match | null> {
  if (!client) {
    console.warn('Turso client not initialized');
    return null;
  }
  try {
    const db = ensureClient();
    const result = await db.execute({
      sql: 'SELECT * FROM matches WHERE id = ?',
      args: [id],
    });
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0] as any;
    return {
      id: row.id,
      date: row.date,
      rawDate: row.raw_date || row.date,
      time: row.time,
      status: row.status as 'pendiente' | 'finalizado',
      player1: {
        name: row.player1_name,
        club: row.player1_club,
      },
      player2: {
        name: row.player2_name,
        club: row.player2_club,
      },
      score1: row.score1 !== null ? row.score1 : undefined,
      score2: row.score2 !== null ? row.score2 : undefined,
      sets: row.sets || undefined,
      photoUrl: row.photo_url || undefined,
      tournamentId: row.tournament_id || undefined,
    };
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const db = ensureClient();
  const id = Date.now().toString();
  const rawDate = match.rawDate || match.date;
  
  await db.execute({
    sql: `INSERT INTO matches (
      id, date, raw_date, time, status, 
      player1_name, player1_club, player2_name, player2_club,
      score1, score2, sets, photo_url, tournament_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      match.date,
      rawDate,
      match.time,
      match.status,
      match.player1.name,
      match.player1.club,
      match.player2.name,
      match.player2.club,
      match.score1 || null,
      match.score2 || null,
      match.sets || null,
      match.photoUrl || null,
      match.tournamentId || null,
    ],
  });
  
  return { id, ...match };
}

export async function updateMatch(id: string, match: Partial<Omit<Match, 'id'>>): Promise<void> {
  const db = ensureClient();
  const updates: string[] = [];
  const args: any[] = [];
  
  if (match.date !== undefined) {
    updates.push('date = ?');
    args.push(match.date);
  }
  if (match.rawDate !== undefined) {
    updates.push('raw_date = ?');
    args.push(match.rawDate);
  }
  if (match.time !== undefined) {
    updates.push('time = ?');
    args.push(match.time);
  }
  if (match.status !== undefined) {
    updates.push('status = ?');
    args.push(match.status);
  }
  if (match.player1 !== undefined) {
    updates.push('player1_name = ?, player1_club = ?');
    args.push(match.player1.name, match.player1.club);
  }
  if (match.player2 !== undefined) {
    updates.push('player2_name = ?, player2_club = ?');
    args.push(match.player2.name, match.player2.club);
  }
  if (match.score1 !== undefined) {
    updates.push('score1 = ?');
    args.push(match.score1);
  }
  if (match.score2 !== undefined) {
    updates.push('score2 = ?');
    args.push(match.score2);
  }
  if (match.sets !== undefined) {
    updates.push('sets = ?');
    args.push(match.sets || null);
  }
  if (match.photoUrl !== undefined) {
    updates.push('photo_url = ?');
    args.push(match.photoUrl || null);
  }
  if (match.tournamentId !== undefined) {
    updates.push('tournament_id = ?');
    args.push(match.tournamentId || null);
  }
  
  if (updates.length > 0) {
    args.push(id);
    await db.execute({
      sql: `UPDATE matches SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }
}

export async function deleteMatch(id: string): Promise<void> {
  const db = ensureClient();
  await db.execute({
    sql: 'DELETE FROM matches WHERE id = ?',
    args: [id],
  });
}

// ===== PREDICTIONS =====

export async function getPredictions(matchId?: string): Promise<Prediction[]> {
  if (!client) {
    console.warn('Turso client not initialized');
    return [];
  }
  try {
    const db = ensureClient();
    let sql = 'SELECT * FROM predictions';
    let args: any[] = [];
    
    if (matchId) {
      sql += ' WHERE match_id = ?';
      args.push(matchId);
    }
    
    sql += ' ORDER BY user_name';
    
    const result = await db.execute({ sql, args });
    
    return result.rows.map((row: any) => ({
      id: row.id,
      matchId: row.match_id,
      predictedWinner: row.predicted_winner as 'player1' | 'player2',
      userName: row.user_name,
      isCorrect: row.is_correct === 1 ? true : row.is_correct === 0 ? false : undefined,
    }));
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}

export async function createPrediction(prediction: Omit<Prediction, 'id'>): Promise<Prediction> {
  const db = ensureClient();
  const id = Date.now().toString();
  
  await db.execute({
    sql: `INSERT INTO predictions (id, match_id, predicted_winner, user_name, is_correct)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      id,
      prediction.matchId,
      prediction.predictedWinner,
      prediction.userName,
      prediction.isCorrect ? 1 : 0,
    ],
  });
  
  return { id, ...prediction };
}

// Función para obtener el ranking de predicciones
export async function getPredictionRanking(): Promise<Array<{ userName: string; correct: number; total: number; accuracy: number }>> {
  if (!client) {
    console.warn('Turso client not initialized');
    return [];
  }
  try {
    const db = ensureClient();
    const result = await db.execute(`
      SELECT 
        user_name,
        COUNT(*) as total,
        SUM(is_correct) as correct
      FROM predictions
      GROUP BY user_name
      ORDER BY correct DESC, total DESC
    `);
    
    return result.rows.map((row: any) => {
      const total = row.total || 0;
      const correct = row.correct || 0;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      
      return {
        userName: row.user_name,
        correct,
        total,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    });
  } catch (error) {
    console.error('Error fetching prediction ranking:', error);
    return [];
  }
}

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  if (!client) {
    console.warn('Turso client not initialized');
    return [];
  }
  try {
    const db = ensureClient();
    const result = await db.execute('SELECT * FROM products ORDER BY name');
    
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      imageUrl: row.image_url || undefined,
      link: row.link || undefined,
      price: row.price !== null ? row.price : undefined,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const db = ensureClient();
  const id = Date.now().toString();
  
  await db.execute({
    sql: `INSERT INTO products (id, name, description, image_url, link, price)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      product.name,
      product.description,
      product.imageUrl || null,
      product.link || null,
      product.price || null,
    ],
  });
  
  return { id, ...product };
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id'>>): Promise<void> {
  const db = ensureClient();
  const updates: string[] = [];
  const args: any[] = [];
  
  if (product.name !== undefined) {
    updates.push('name = ?');
    args.push(product.name);
  }
  if (product.description !== undefined) {
    updates.push('description = ?');
    args.push(product.description);
  }
  if (product.imageUrl !== undefined) {
    updates.push('image_url = ?');
    args.push(product.imageUrl || null);
  }
  if (product.link !== undefined) {
    updates.push('link = ?');
    args.push(product.link || null);
  }
  if (product.price !== undefined) {
    updates.push('price = ?');
    args.push(product.price || null);
  }
  
  if (updates.length > 0) {
    args.push(id);
    await db.execute({
      sql: `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = ensureClient();
  await db.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [id],
  });
}

