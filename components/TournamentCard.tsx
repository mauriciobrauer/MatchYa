import Link from 'next/link';
import { Tournament } from '@/lib/db';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link href={`/tournament/${tournament.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">{tournament.name}</h3>
            <div className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
              {tournament.dates.join(' • ')}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {tournament.club1}
              </span>
              <span className="text-gray-400 font-semibold">VS</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {tournament.club2}
              </span>
            </div>
            {tournament.description && (
              <p className="text-sm text-gray-600 mt-4">{tournament.description}</p>
            )}
          </div>
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
