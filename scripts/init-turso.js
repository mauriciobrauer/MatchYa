const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || 'libsql://matchya-maubrauer.aws-us-east-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJjNDk2NTQ5My0xODcwLTQxZDgtYjEyNy03MDk5YjRiNDYzOGQiLCJpYXQiOjE3NjIyMTU1ODksInJpZCI6IjViOTg2NmIwLTU0N2QtNGIzZC04NmRmLTZiMDJjZDFiNzhkMiJ9.l2fnuP4Z29u9uL9SNhZ98InohNawqcRcV-GePQwgyoHCWWz8JuXwfUJufTC_bNQ7Ff5P9kKEaieOFCMoPnqvAw';

const client = createClient({
  url,
  authToken,
});

async function initDatabase() {
  try {
    console.log('Conectando a Turso...');

    // Crear tabla tournaments
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dates TEXT NOT NULL,
        club1 TEXT NOT NULL,
        club2 TEXT NOT NULL,
        description TEXT
      )
    `);
    console.log('✅ Tabla tournaments creada');

    // Crear tabla players
    await client.execute(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        club TEXT NOT NULL,
        photo_url TEXT,
        tournament_id TEXT
      )
    `);
    console.log('✅ Tabla players creada');

    // Crear tabla matches
    await client.execute(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        raw_date TEXT,
        time TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pendiente', 'finalizado')),
        player1_name TEXT NOT NULL,
        player1_club TEXT NOT NULL,
        player2_name TEXT NOT NULL,
        player2_club TEXT NOT NULL,
        score1 INTEGER,
        score2 INTEGER,
        sets TEXT,
        photo_url TEXT,
        tournament_id TEXT
      )
    `);
    console.log('✅ Tabla matches creada');

    // Crear tabla predictions
    await client.execute(`
      CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        predicted_winner TEXT NOT NULL CHECK(predicted_winner IN ('player1', 'player2')),
        user_name TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Tabla predictions creada');

    // Crear tabla products
    await client.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link TEXT,
        price REAL
      )
    `);
    console.log('✅ Tabla products creada');

    // Crear índices para mejorar el rendimiento
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id)
    `);
    console.log('✅ Índices creados');

    console.log('\n🎉 Base de datos inicializada correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase();

