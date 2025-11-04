import Image from 'next/image';
import { Match } from '@/lib/db';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === 'finalizado';
  const winner =
    isFinished && match.score1 !== undefined && match.score2 !== undefined
      ? match.score1 > match.score2
        ? 'player1'
        : 'player2'
      : null;

  // Convertir hora de 24h a 12h con AM/PM
  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const displayTime = convertTo12Hour(match.time);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-600">
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
          <span className="text-lg sm:text-xl font-bold">{displayTime}</span>
        </div>
        <span
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            isFinished
              ? 'bg-black text-white'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {isFinished ? 'Finalizado' : 'Pendiente'}
        </span>
      </div>

      {match.photoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={match.photoUrl}
            alt={`Partido ${match.player1.name} vs ${match.player2.name}`}
            width={600}
            height={400}
            className="w-full h-40 sm:h-48 object-cover"
          />
        </div>
      )}

      {/* Layout responsivo: vertical en móvil, horizontal en desktop */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0">
        <div className={`w-full sm:flex-1 ${winner === 'player1' ? 'bg-green-50 rounded-lg p-3 sm:p-4 relative' : ''}`}>
          {winner === 'player1' && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            {match.player1.photoUrl ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-gray-200">
                <Image
                  src={match.player1.photoUrl}
                  alt={match.player1.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 mb-2 flex items-center justify-center border-2 border-gray-300">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <p className="font-bold text-base sm:text-lg text-gray-900 break-words px-2">{match.player1.name}</p>
            <p className="text-xs sm:text-sm text-gray-600">{match.player1.club}</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              {isFinished && match.score1 !== undefined ? match.score1 : 0}
            </p>
          </div>
        </div>

        <div className="py-2 sm:py-0 sm:px-4 flex flex-row sm:flex-col items-center gap-2 sm:gap-0">
          <p className="text-gray-400 font-semibold text-base sm:text-lg">VS</p>
          {match.sets && (
            <p className="text-xs sm:text-sm text-gray-500 text-center">{match.sets}</p>
          )}
        </div>

        <div className={`w-full sm:flex-1 ${winner === 'player2' ? 'bg-green-50 rounded-lg p-3 sm:p-4 relative' : ''}`}>
          {winner === 'player2' && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            {match.player2.photoUrl ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-gray-200">
                <Image
                  src={match.player2.photoUrl}
                  alt={match.player2.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 mb-2 flex items-center justify-center border-2 border-gray-300">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <p className="font-bold text-base sm:text-lg text-gray-900 break-words px-2">{match.player2.name}</p>
            <p className="text-xs sm:text-sm text-gray-600">{match.player2.club}</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              {isFinished && match.score2 !== undefined ? match.score2 : 0}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
