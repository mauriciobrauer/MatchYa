import Header from '@/components/Header';
import TournamentCard from '@/components/TournamentCard';
import { getTournaments } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tournaments = await getTournaments();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Torneos</h1>
          <p className="text-sm sm:text-base text-gray-600">Selecciona un torneo para ver los partidos</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No hay torneos registrados aún.</p>
          )}
        </div>
      </main>
    </div>
  );
}
