const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || 'libsql://matchya-maubrauer.aws-us-east-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJjNDk2NTQ5My0xODcwLTQxZDgtYjEyNy03MDk5YjRiNDYzOGQiLCJpYXQiOjE3NjIyMTU1ODksInJpZCI6IjViOTg2NmIwLTU0N2QtNGIzZC04NmRmLTZiMDJjZDFiNzhkMiJ9.l2fnuP4Z29u9uL9SNhZ98InohNawqcRcV-GePQwgyoHCWWz8JuXwfUJufTC_bNQ7Ff5P9kKEaieOFCMoPnqvAw';

const client = createClient({
  url,
  authToken,
});

// Datos mock de tournaments
const mockTournaments = [
  {
    id: '1',
    name: 'Dual Meet Asturiano Vs Hacienda',
    dates: ['Nov 9 - 2025', 'Nov 10 - 2025'],
    club1: 'Asturiano',
    club2: 'Hacienda',
    description: 'Torneo de squash entre Asturiano y Hacienda',
  },
];

// Datos mock de products
const mockProducts = [
  {
    id: '1',
    name: 'Sudadera Suva',
    description: 'Sudadera deportiva de alta calidad',
    imageUrl: 'https://camach.com.mx/cdn/shop/products/2_e5c0fe77-2ab6-4a9d-9b94-71cb50770317_684x@2x.jpg?v=1638983896',
    link: 'https://camach.com.mx/collections/nuevos/products/sudadera-suva-3',
    price: 549.00,
  },
  {
    id: '2',
    name: 'Sudadera Suva',
    description: 'Sudadera deportiva de alta calidad',
    imageUrl: 'https://camach.com.mx/cdn/shop/products/2_2e1161d8-3dd7-4c3c-b826-3d871ca900e9_684x@2x.jpg?v=1638983744',
    link: 'https://camach.com.mx/collections/nuevos/products/sudadera-suva-2',
    price: 549.00,
  },
  {
    id: '3',
    name: 'Sudadera Suva',
    description: 'Sudadera deportiva de alta calidad',
    imageUrl: 'https://camach.com.mx/cdn/shop/products/2_d5c2a1cf-0801-4c6a-9973-6a3a0f2bc069_684x@2x.jpg?v=1638983238',
    link: 'https://camach.com.mx/collections/nuevos/products/sudadera-suva-1',
    price: 549.00,
  },
  {
    id: '4',
    name: 'Sudadera Winter',
    description: 'Sudadera para temporada invernal',
    imageUrl: 'https://camach.com.mx/cdn/shop/products/2_0dfdf855-c361-4d9a-82c2-e924e930d119_684x@2x.jpg?v=1636744906',
    link: 'https://camach.com.mx/collections/nuevos/products/sudadera-winter-1',
    price: 750.00,
  },
];

// Datos mock de matches - Todos del 9 de noviembre
const mockMatches = [
  { id: '1', date: '9 nov', rawDate: '2025-11-09', time: '09:30', status: 'pendiente', player1: { name: 'Karen Muñiz', club: 'Asturiano' }, player2: { name: 'Fernanda López', club: 'Hacienda' }, tournamentId: '1' },
  { id: '2', date: '9 nov', rawDate: '2025-11-09', time: '09:30', status: 'pendiente', player1: { name: 'Gabriela Rodríguez', club: 'Asturiano' }, player2: { name: 'Sofía Cisneros', club: 'Hacienda' }, tournamentId: '1' },
  { id: '3', date: '9 nov', rawDate: '2025-11-09', time: '09:50', status: 'pendiente', player1: { name: 'Santiago Casarrubias', club: 'Asturiano' }, player2: { name: 'David Camacho', club: 'Hacienda' }, tournamentId: '1' },
  { id: '4', date: '9 nov', rawDate: '2025-11-09', time: '09:50', status: 'pendiente', player1: { name: 'Mario Toledano', club: 'Asturiano' }, player2: { name: 'Adriana Martínez', club: 'Hacienda' }, tournamentId: '1' },
  { id: '5', date: '9 nov', rawDate: '2025-11-09', time: '10:10', status: 'pendiente', player1: { name: 'Raúl Álvarez', club: 'Asturiano' }, player2: { name: 'Héctor Cisneros', club: 'Hacienda' }, tournamentId: '1' },
  { id: '6', date: '9 nov', rawDate: '2025-11-09', time: '10:10', status: 'pendiente', player1: { name: 'Abraham Figueroa', club: 'Asturiano' }, player2: { name: 'Ramón Palafox', club: 'Hacienda' }, tournamentId: '1' },
  { id: '7', date: '9 nov', rawDate: '2025-11-09', time: '10:30', status: 'pendiente', player1: { name: 'Jesús Luna', club: 'Asturiano' }, player2: { name: 'Ismael Monroy', club: 'Hacienda' }, tournamentId: '1' },
  { id: '8', date: '9 nov', rawDate: '2025-11-09', time: '10:30', status: 'pendiente', player1: { name: 'Cristian Torres', club: 'Asturiano' }, player2: { name: 'Gabriel Zarco', club: 'Hacienda' }, tournamentId: '1' },
  { id: '9', date: '9 nov', rawDate: '2025-11-09', time: '10:40', status: 'pendiente', player1: { name: 'Francsco Trejo', club: 'Asturiano' }, player2: { name: 'Jacqueline Camacho', club: 'Hacienda' }, tournamentId: '1' },
  { id: '10', date: '9 nov', rawDate: '2025-11-09', time: '10:40', status: 'pendiente', player1: { name: 'Job Ascárraga', club: 'Asturiano' }, player2: { name: 'Mauricio Brauer', club: 'Hacienda' }, tournamentId: '1' },
  { id: '11', date: '9 nov', rawDate: '2025-11-09', time: '11:00', status: 'pendiente', player1: { name: 'Ghiberti Alonso', club: 'Asturiano' }, player2: { name: 'Kevin Pedroza', club: 'Hacienda' }, tournamentId: '1' },
  { id: '12', date: '9 nov', rawDate: '2025-11-09', time: '11:00', status: 'pendiente', player1: { name: 'Manuel González', club: 'Asturiano' }, player2: { name: 'Julio Téllez', club: 'Hacienda' }, tournamentId: '1' },
  { id: '13', date: '9 nov', rawDate: '2025-11-09', time: '11:20', status: 'pendiente', player1: { name: 'Karen Muñiz', club: 'Asturiano' }, player2: { name: 'Sofía Cisneros', club: 'Hacienda' }, tournamentId: '1' },
  { id: '14', date: '9 nov', rawDate: '2025-11-09', time: '11:20', status: 'pendiente', player1: { name: 'Gabriela Rodríguez', club: 'Asturiano' }, player2: { name: 'Fernanda López', club: 'Hacienda' }, tournamentId: '1' },
  { id: '15', date: '9 nov', rawDate: '2025-11-09', time: '11:40', status: 'pendiente', player1: { name: 'Santiago Casarrubias', club: 'Asturiano' }, player2: { name: 'Adriana Martínez', club: 'Hacienda' }, tournamentId: '1' },
  { id: '16', date: '9 nov', rawDate: '2025-11-09', time: '11:40', status: 'pendiente', player1: { name: 'Mario Toledano', club: 'Asturiano' }, player2: { name: 'David Camacho', club: 'Hacienda' }, tournamentId: '1' },
  { id: '17', date: '9 nov', rawDate: '2025-11-09', time: '12:00', status: 'pendiente', player1: { name: 'Raúl Álvarez', club: 'Asturiano' }, player2: { name: 'Ramón Palafox', club: 'Hacienda' }, tournamentId: '1' },
  { id: '18', date: '9 nov', rawDate: '2025-11-09', time: '12:00', status: 'pendiente', player1: { name: 'Abraham Figueroa', club: 'Asturiano' }, player2: { name: 'Héctor Cisneros', club: 'Hacienda' }, tournamentId: '1' },
  { id: '19', date: '9 nov', rawDate: '2025-11-09', time: '12:20', status: 'pendiente', player1: { name: 'Jesús Luna', club: 'Asturiano' }, player2: { name: 'Gabriel Zarco', club: 'Hacienda' }, tournamentId: '1' },
  { id: '20', date: '9 nov', rawDate: '2025-11-09', time: '12:20', status: 'pendiente', player1: { name: 'Cristian Torres', club: 'Asturiano' }, player2: { name: 'Ismael Monroy', club: 'Hacienda' }, tournamentId: '1' },
  { id: '21', date: '9 nov', rawDate: '2025-11-09', time: '12:40', status: 'pendiente', player1: { name: 'Francsco Trejo', club: 'Asturiano' }, player2: { name: 'Mauricio Brauer', club: 'Hacienda' }, tournamentId: '1' },
  { id: '22', date: '9 nov', rawDate: '2025-11-09', time: '12:40', status: 'pendiente', player1: { name: 'Job Ascárraga', club: 'Asturiano' }, player2: { name: 'Jacqueline Camacho', club: 'Hacienda' }, tournamentId: '1' },
  { id: '23', date: '9 nov', rawDate: '2025-11-09', time: '13:00', status: 'pendiente', player1: { name: 'Ghiberti Alonso', club: 'Asturiano' }, player2: { name: 'Julio Téllez', club: 'Hacienda' }, tournamentId: '1' },
  { id: '24', date: '9 nov', rawDate: '2025-11-09', time: '13:00', status: 'pendiente', player1: { name: 'Manuel González', club: 'Asturiano' }, player2: { name: 'Kevin Pedroza', club: 'Hacienda' }, tournamentId: '1' },
];

async function populateDatabase() {
  try {
    console.log('Conectando a Turso...\n');

    // Limpiar tablas existentes (opcional - comentar si quieres mantener datos existentes)
    console.log('⚠️  Limpiando tablas existentes...');
    await client.execute('DELETE FROM predictions');
    await client.execute('DELETE FROM matches');
    await client.execute('DELETE FROM players');
    await client.execute('DELETE FROM products');
    await client.execute('DELETE FROM tournaments');
    console.log('✅ Tablas limpiadas\n');

    // Insertar Tournaments
    console.log('📅 Insertando torneos...');
    for (const tournament of mockTournaments) {
      const datesStr = Array.isArray(tournament.dates) ? tournament.dates.join(',') : tournament.dates || '';
      await client.execute({
        sql: `INSERT INTO tournaments (id, name, dates, club1, club2, description) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [tournament.id, tournament.name, datesStr, tournament.club1, tournament.club2, tournament.description || null],
      });
      console.log(`  ✅ ${tournament.name}`);
    }

    // Insertar Products
    console.log('\n🛍️  Insertando productos...');
    for (const product of mockProducts) {
      await client.execute({
        sql: `INSERT INTO products (id, name, description, image_url, link, price)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          product.id,
          product.name,
          product.description,
          product.imageUrl || null,
          product.link || null,
          product.price || null,
        ],
      });
      console.log(`  ✅ ${product.name}`);
    }

    // Insertar Matches
    console.log('\n🏸 Insertando partidos...');
    for (const match of mockMatches) {
      await client.execute({
        sql: `INSERT INTO matches (
          id, date, raw_date, time, status, 
          player1_name, player1_club, player2_name, player2_club,
          score1, score2, sets, photo_url, tournament_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          match.id,
          match.date,
          match.rawDate || match.date,
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
      console.log(`  ✅ ${match.player1.name} vs ${match.player2.name} (${match.date})`);
    }

    // Extraer jugadores únicos de los partidos e insertarlos
    console.log('\n👥 Insertando jugadores...');
    const playersMap = new Map();
    
    for (const match of mockMatches) {
      // Jugador 1
      const player1Key = `${match.player1.name}-${match.player1.club}`;
      if (!playersMap.has(player1Key)) {
        playersMap.set(player1Key, {
          name: match.player1.name,
          club: match.player1.club,
          tournamentId: match.tournamentId,
        });
      }
      
      // Jugador 2
      const player2Key = `${match.player2.name}-${match.player2.club}`;
      if (!playersMap.has(player2Key)) {
        playersMap.set(player2Key, {
          name: match.player2.name,
          club: match.player2.club,
          tournamentId: match.tournamentId,
        });
      }
    }
    
    // Insertar jugadores únicos
    let playerCount = 0;
    for (const [key, player] of playersMap) {
      const playerId = `player-${Date.now()}-${playerCount}`;
      await client.execute({
        sql: `INSERT INTO players (id, name, club, photo_url, tournament_id)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          playerId,
          player.name,
          player.club,
          null, // photo_url
          player.tournamentId || null,
        ],
      });
      console.log(`  ✅ ${player.name} (${player.club})`);
      playerCount++;
    }

    console.log('\n🎉 Base de datos poblada correctamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - ${mockTournaments.length} torneo(s)`);
    console.log(`   - ${mockProducts.length} producto(s)`);
    console.log(`   - ${mockMatches.length} partido(s)`);
    console.log(`   - ${playersMap.size} jugador(es)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

populateDatabase();

