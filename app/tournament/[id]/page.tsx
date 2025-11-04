'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import MatchCard from '@/components/MatchCard';
import ProductCard from '@/components/ProductCard';
import { Match } from '@/lib/db';
import { Tournament } from '@/lib/db';
import { Product } from '@/lib/db';

interface TournamentPageProps {
  params: {
    id: string;
  };
}

export default function TournamentPage({ params }: TournamentPageProps) {
  const [activeDateTab, setActiveDateTab] = useState<string>('nov-9');
  const [activeMatchTypeTab, setActiveMatchTypeTab] = useState<'proximos' | 'finalizados'>('proximos');
  const [matches, setMatches] = useState<Match[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch matches for this tournament
        const matchesResponse = await fetch(`/api/matches?tournamentId=${params.id}`);
        const matchesData = await matchesResponse.json();
        setMatches(matchesData || []);

        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        setProducts(productsData || []);

        // Fetch tournament
        const tournamentResponse = await fetch(`/api/tournaments/${params.id}`);
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  // Organizar partidos por fecha y estado
  const matchesByDate = useMemo(() => {
    const grouped: Record<string, { pendientes: Match[]; finalizados: Match[] }> = {
      'nov-9': { pendientes: [], finalizados: [] },
      'nov-10': { pendientes: [], finalizados: [] },
    };

    matches.forEach(match => {
      const isFinalizado = match.status === 'finalizado';
      const matchDate = match.date || '';
      
      // Agregar a Nov 9 o Nov 10 según la fecha
      if (matchDate.includes('9 nov') || matchDate === '9 nov') {
        if (isFinalizado) {
          grouped['nov-9'].finalizados.push(match);
        } else {
          grouped['nov-9'].pendientes.push(match);
        }
      } else if (matchDate.includes('10 nov') || matchDate === '10 nov') {
        if (isFinalizado) {
          grouped['nov-10'].finalizados.push(match);
        } else {
          grouped['nov-10'].pendientes.push(match);
        }
      } else {
        // Si no coincide con ninguna fecha específica, agregar a nov-9 por defecto
        if (isFinalizado) {
          grouped['nov-9'].finalizados.push(match);
        } else {
          grouped['nov-9'].pendientes.push(match);
        }
      }
    });

    return grouped;
  }, [matches]);

  const currentMatchesData = matchesByDate[activeDateTab] || { pendientes: [], finalizados: [] };

  // Calcular resultado global entre ambos clubes
  const globalScore = useMemo(() => {
    if (!tournament) return { 
      partidos: { club1: 0, club2: 0 }, 
      sets: { club1: 0, club2: 0 } 
    };
    
    const finishedMatches = matches.filter(
      m => m.status === 'finalizado' && 
      m.score1 !== undefined && 
      m.score2 !== undefined
    );

    let club1Partidos = 0;
    let club2Partidos = 0;
    let club1Sets = 0;
    let club2Sets = 0;

    finishedMatches.forEach(match => {
      // Calcular partidos ganados
      if (match.score1! > match.score2!) {
        // Player 1 ganó el partido
        if (match.player1.club === tournament.club1) {
          club1Partidos++;
        } else if (match.player1.club === tournament.club2) {
          club2Partidos++;
        }
      } else if (match.score2! > match.score1!) {
        // Player 2 ganó el partido
        if (match.player2.club === tournament.club1) {
          club1Partidos++;
        } else if (match.player2.club === tournament.club2) {
          club2Partidos++;
        }
      }

      // Calcular sets ganados
      if (match.sets) {
        // Parsear sets en formato "3 - 1" o similar
        const setsMatch = match.sets.match(/(\d+)\s*-\s*(\d+)/);
        if (setsMatch) {
          const sets1 = parseInt(setsMatch[1], 10);
          const sets2 = parseInt(setsMatch[2], 10);
          
          // Determinar qué jugador ganó los sets
          if (sets1 > sets2) {
            // Player 1 ganó más sets
            if (match.player1.club === tournament.club1) {
              club1Sets += sets1;
              club2Sets += sets2;
            } else if (match.player1.club === tournament.club2) {
              club2Sets += sets1;
              club1Sets += sets2;
            }
          } else if (sets2 > sets1) {
            // Player 2 ganó más sets
            if (match.player2.club === tournament.club1) {
              club1Sets += sets2;
              club2Sets += sets1;
            } else if (match.player2.club === tournament.club2) {
              club2Sets += sets2;
              club1Sets += sets1;
            }
          } else {
            // Empate en sets
            if (match.player1.club === tournament.club1) {
              club1Sets += sets1;
              club2Sets += sets2;
            } else if (match.player1.club === tournament.club2) {
              club2Sets += sets1;
              club1Sets += sets2;
            }
          }
        }
      } else {
        // Si no hay sets, usar los scores como sets
        if (match.score1! > match.score2!) {
          if (match.player1.club === tournament.club1) {
            club1Sets += match.score1!;
            club2Sets += match.score2!;
          } else if (match.player1.club === tournament.club2) {
            club2Sets += match.score1!;
            club1Sets += match.score2!;
          }
        } else if (match.score2! > match.score1!) {
          if (match.player2.club === tournament.club1) {
            club1Sets += match.score2!;
            club2Sets += match.score1!;
          } else if (match.player2.club === tournament.club2) {
            club2Sets += match.score2!;
            club1Sets += match.score1!;
          }
        }
      }
    });

    return { 
      partidos: { club1: club1Partidos, club2: club2Partidos },
      sets: { club1: club1Sets, club2: club2Sets }
    };
  }, [matches, tournament]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Torneo no encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {products.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Productos Patrocinados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Título del Torneo */}
        {tournament && (
          <div className="mb-6 sm:mb-8 text-center px-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{tournament.name}</h2>
          </div>
        )}

        {/* Tabs de Fechas */}
        {tournament && (
          <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveDateTab('nov-9')}
                className={`px-4 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
                  activeDateTab === 'nov-9'
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Nov 9
              </button>
              <button
                onClick={() => setActiveDateTab('nov-10')}
                className={`px-4 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
                  activeDateTab === 'nov-10'
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Nov 10
              </button>
            </div>
          </div>
        )}

        {/* Resultado Global */}
        {tournament && (
          <section className="mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                Resultado Global
              </h3>
              
              {/* Partidos Ganados */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
                  Partidos Ganados
                </h4>
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  {/* Club 1 */}
                  <div className="flex-1 text-center min-w-0">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {globalScore.partidos.club1}
                        </span>
                      </div>
                    </div>
                    <h5 className="text-base sm:text-lg font-bold text-gray-900 break-words px-1">{tournament.club1}</h5>
                  </div>

                  {/* VS Separator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400">VS</span>
                  </div>

                  {/* Club 2 */}
                  <div className="flex-1 text-center min-w-0">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {globalScore.partidos.club2}
                        </span>
                      </div>
                    </div>
                    <h5 className="text-base sm:text-lg font-bold text-gray-900 break-words px-1">{tournament.club2}</h5>
                  </div>
                </div>
              </div>

              {/* Sets Ganados */}
              <div className="border-t border-gray-200 pt-6 sm:pt-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
                  Sets Ganados
                </h4>
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  {/* Club 1 */}
                  <div className="flex-1 text-center min-w-0">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {globalScore.sets.club1}
                        </span>
                      </div>
                    </div>
                    <h5 className="text-base sm:text-lg font-bold text-gray-900 break-words px-1">{tournament.club1}</h5>
                  </div>

                  {/* VS Separator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400">VS</span>
                  </div>

                  {/* Club 2 */}
                  <div className="flex-1 text-center min-w-0">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {globalScore.sets.club2}
                        </span>
                      </div>
                    </div>
                    <h5 className="text-base sm:text-lg font-bold text-gray-900 break-words px-1">{tournament.club2}</h5>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contenido de Partidos según Tab */}
        <section>
          {/* Sub-tabs para Próximos Partidos y Partidos Finalizados */}
              <div className="mb-4 sm:mb-6">
                <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveMatchTypeTab('proximos')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                      activeMatchTypeTab === 'proximos'
                        ? 'border-black text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden xs:inline">Próximos Partidos</span>
                    <span className="xs:hidden">Próximos</span>
                  </button>
                  <button
                    onClick={() => setActiveMatchTypeTab('finalizados')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                      activeMatchTypeTab === 'finalizados'
                        ? 'border-black text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden xs:inline">Partidos Finalizados</span>
                    <span className="xs:hidden">Finalizados</span>
                  </button>
                </div>
              </div>

              {/* Contenido según el tab activo */}
              {activeMatchTypeTab === 'proximos' ? (
                <div>
                  {currentMatchesData.pendientes.length > 0 ? (
                    <div className="space-y-6">
                      {currentMatchesData.pendientes.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg mb-2">No hay partidos pendientes para esta fecha.</p>
                      <p className="text-gray-400 text-sm">Los partidos aparecerán aquí cuando se programen.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {currentMatchesData.finalizados.length > 0 ? (
                    <div className="space-y-6">
                      {currentMatchesData.finalizados.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg mb-2">No hay partidos finalizados para esta fecha aún.</p>
                      <p className="text-gray-400 text-sm">Los resultados aparecerán aquí cuando se completen los partidos.</p>
                    </div>
                  )}
                </div>
              )}
        </section>
      </main>
    </div>
  );
}
