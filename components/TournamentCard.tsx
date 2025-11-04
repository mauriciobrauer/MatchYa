import Link from 'next/link';
import { Tournament } from '@/lib/db';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link href={`/tournament/${tournament.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{tournament.name}</h3>
            <div className="text-sm sm:text-base text-gray-600">
              {tournament.dates.join(' • ')}
            </div>
          </div>
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0"
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
