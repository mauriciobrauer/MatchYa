export interface Tournament {
  id: string;
  name: string;
  dates: string[]; // Múltiples fechas del torneo
  club1: string;
  club2: string;
  description?: string;
}

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Dual Meet Asturiano Vs Hacienda',
    dates: ['Nov 9 - 2025', 'Nov 10 - 2025'],
    club1: 'Asturiano',
    club2: 'Hacienda',
    description: 'Torneo de squash entre clubes Asturiano y Hacienda',
  },
];
