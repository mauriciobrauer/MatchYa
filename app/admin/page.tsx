'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Match, Player } from '@/lib/db';
import { Tournament } from '@/lib/db';

interface PlayerWithId extends Player {
  id: string;
  tournamentId?: string;
}

type TournamentTabType = 'partidos' | 'jugadores';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list'); // 'list' = lista de torneos, 'edit' = editando un torneo
  const [tournamentTab, setTournamentTab] = useState<TournamentTabType>('jugadores'); // Tab activo cuando estás editando un torneo
  const [activeDateTab, setActiveDateTab] = useState<string>('nov-9'); // Tab de fecha activo en partidos
  const [activeMatchTypeTab, setActiveMatchTypeTab] = useState<'proximos' | 'finalizados'>('proximos'); // Tab de tipo de partido activo
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<PlayerWithId[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(''); // Torneo seleccionado para filtrar
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithId | null>(null);
  const [tournamentFormData, setTournamentFormData] = useState({
    name: '',
    dates: [''] as string[], // Array de fechas
    club1: '',
    club2: '',
    description: '',
  });
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    status: 'pendiente' as 'pendiente' | 'finalizado',
    player1Name: '',
    player1Club: '',
    player2Name: '',
    player2Club: '',
    score1: '',
    score2: '',
    sets: '',
    photoUrl: '',
    tournamentId: '', // Torneo al que pertenece el partido
  });
  const [playerFormData, setPlayerFormData] = useState({
    name: '',
    club: '',
    photoUrl: '',
  });
  const [playerPhotoFile, setPlayerPhotoFile] = useState<File | null>(null);
  const [playerPhotoPreview, setPlayerPhotoPreview] = useState<string>('');
  const [matchPhotoFile, setMatchPhotoFile] = useState<File | null>(null);
  const [matchPhotoPreview, setMatchPhotoPreview] = useState<string>('');

  useEffect(() => {
    // Verificar autenticación
    const authStatus = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!authStatus) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    fetchMatches();
    fetchTournaments();
  }, [router]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTournamentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar fechas vacías
    const validDates = tournamentFormData.dates.filter(date => date.trim() !== '');
    
    if (validDates.length === 0) {
      alert('Por favor, ingresa al menos una fecha para el torneo.');
      return;
    }
    
    setIsLoading(true);
    try {
      if (editingTournament) {
        // Editar torneo existente
        const response = await fetch(`/api/tournaments/${editingTournament.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...tournamentFormData,
            dates: validDates,
          }),
        });
        
        if (response.ok) {
          await fetchTournaments();
          alert('Torneo actualizado');
        } else {
          alert('Error al actualizar el torneo');
        }
      } else {
        // Crear nuevo torneo
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...tournamentFormData,
            dates: validDates,
          }),
        });
        
        if (response.ok) {
          await fetchTournaments();
          alert('Torneo creado');
        } else {
          alert('Error al crear el torneo');
        }
      }
      
      setShowTournamentModal(false);
      resetTournamentForm();
    } catch (error) {
      console.error('Error saving tournament:', error);
      alert('Error al guardar el torneo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setSelectedTournamentId(tournament.id);
    setViewMode('edit');
    setTournamentTab('jugadores'); // Por defecto mostrar jugadores
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingTournament(null);
    setSelectedTournamentId('');
  };

  const handleDeleteTournament = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este torneo?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tournaments/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchTournaments();
          alert('Torneo eliminado');
        } else {
          alert('Error al eliminar el torneo');
        }
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('Error al eliminar el torneo');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetTournamentForm = () => {
    setEditingTournament(null);
    setTournamentFormData({
      name: '',
      dates: [''],
      club1: '',
      club2: '',
      description: '',
    });
  };

  const addDateField = () => {
    setTournamentFormData({
      ...tournamentFormData,
      dates: [...tournamentFormData.dates, ''],
    });
  };

  const removeDateField = (index: number) => {
    const newDates = tournamentFormData.dates.filter((_, i) => i !== index);
    setTournamentFormData({
      ...tournamentFormData,
      dates: newDates.length > 0 ? newDates : [''],
    });
  };

  const updateDateField = (index: number, value: string) => {
    const newDates = [...tournamentFormData.dates];
    newDates[index] = value;
    setTournamentFormData({
      ...tournamentFormData,
      dates: newDates,
    });
  };

  // Filtrar partidos por torneo seleccionado
  const filteredMatches = selectedTournamentId
    ? matches.filter(m => m.tournamentId === selectedTournamentId)
    : matches;

  // Organizar partidos por fecha y estado para el admin
  const matchesByDateAndStatus = useMemo(() => {
    const grouped: Record<string, { pendientes: Match[]; finalizados: Match[] }> = {
      'nov-9': { pendientes: [], finalizados: [] },
      'nov-10': { pendientes: [], finalizados: [] },
    };

    filteredMatches.forEach(match => {
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
  }, [filteredMatches]);

  const currentAdminMatchesData = matchesByDateAndStatus[activeDateTab] || { pendientes: [], finalizados: [] };

  // Extraer jugadores únicos de los partidos del torneo seleccionado
  const filteredPlayers = useMemo(() => {
    const playersMap = new Map<string, PlayerWithId>();
    
    filteredMatches.forEach(match => {
      // Jugador 1
      const player1Key = `${match.player1.name}-${match.player1.club}`;
      if (!playersMap.has(player1Key)) {
        playersMap.set(player1Key, {
          id: `player-${match.player1.name}-${match.player1.club}-${Date.now()}`,
          name: match.player1.name,
          club: match.player1.club,
          photoUrl: match.player1.photoUrl,
          tournamentId: match.tournamentId,
        });
      }
      
      // Jugador 2
      const player2Key = `${match.player2.name}-${match.player2.club}`;
      if (!playersMap.has(player2Key)) {
        playersMap.set(player2Key, {
          id: `player-${match.player2.name}-${match.player2.club}-${Date.now()}`,
          name: match.player2.name,
          club: match.player2.club,
          photoUrl: match.player2.photoUrl,
          tournamentId: match.tournamentId,
        });
      }
    });
    
    // Convertir Map a Array y ordenar por nombre
    return Array.from(playersMap.values()).sort((a, b) => {
      if (a.club !== b.club) {
        return a.club.localeCompare(b.club);
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredMatches]);

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlayer) {
      // Actualizar jugador en todos los partidos donde aparece
      const updatedMatches = matches.map(match => {
        const updatedMatch = { ...match };
        
        // Actualizar si es player1
        if (match.player1.name === editingPlayer.name && match.player1.club === editingPlayer.club) {
          updatedMatch.player1 = {
            name: playerFormData.name,
            club: playerFormData.club,
            photoUrl: playerFormData.photoUrl || undefined,
          };
        }
        
        // Actualizar si es player2
        if (match.player2.name === editingPlayer.name && match.player2.club === editingPlayer.club) {
          updatedMatch.player2 = {
            name: playerFormData.name,
            club: playerFormData.club,
            photoUrl: playerFormData.photoUrl || undefined,
          };
        }
        
        return updatedMatch;
      });
      
      setMatches(updatedMatches);
      alert('Jugador actualizado en todos los partidos');
    } else {
      // No se pueden crear jugadores nuevos, deben crearse a través de partidos
      alert('Para agregar un jugador, crea un nuevo partido con ese jugador.');
      return;
    }
    
    setShowPlayerModal(false);
    resetPlayerForm();
  };

  const handleEditPlayer = (player: PlayerWithId) => {
    setEditingPlayer(player);
    setPlayerFormData({
      name: player.name,
      club: player.club,
      photoUrl: player.photoUrl || '',
    });
    setPlayerPhotoPreview(player.photoUrl || '');
    setPlayerPhotoFile(null);
    setShowPlayerModal(true);
  };

  const handleDeletePlayer = (player: PlayerWithId) => {
    if (confirm(`¿Estás seguro de que quieres eliminar este jugador? Esto eliminará todos los partidos donde participa "${player.name} (${player.club})".`)) {
      // Eliminar todos los partidos donde aparece este jugador
      const updatedMatches = matches.filter(match => {
        const isPlayer1 = match.player1.name === player.name && match.player1.club === player.club;
        const isPlayer2 = match.player2.name === player.name && match.player2.club === player.club;
        return !(isPlayer1 || isPlayer2);
      });
      
      setMatches(updatedMatches);
      alert('Jugador eliminado. Se han eliminado todos los partidos donde participaba.');
    }
  };

  const resetPlayerForm = () => {
    setEditingPlayer(null);
    setPlayerFormData({
      name: '',
      club: '',
      photoUrl: '',
    });
    setPlayerPhotoFile(null);
    setPlayerPhotoPreview('');
  };

  const handlePlayerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      setPlayerPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlayerPhotoPreview(reader.result as string);
        setPlayerFormData({ ...playerFormData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMatchPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      setMatchPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMatchPhotoPreview(reader.result as string);
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que si el estado es finalizado, tenga resultados
    if (formData.status === 'finalizado') {
      if (!formData.score1 || !formData.score2) {
        alert('Por favor, ingresa los resultados del partido (puntuación de ambos jugadores)');
        return;
      }
    }

    setIsLoading(true);

    try {
      const url = editingMatch
        ? `/api/matches/${editingMatch.id}`
        : '/api/matches';
      const method = editingMatch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            time: formData.time,
            status: formData.status,
            player1: {
              name: formData.player1Name,
              club: formData.player1Club,
            },
            player2: {
              name: formData.player2Name,
              club: formData.player2Club,
            },
            score1: formData.score1 ? parseInt(formData.score1) : undefined,
            score2: formData.score2 ? parseInt(formData.score2) : undefined,
            sets: formData.sets || undefined,
            photoUrl: formData.photoUrl || undefined,
            tournamentId: formData.tournamentId || undefined,
          }),
      });

      if (response.ok) {
        const data = await response.json();
        // Si estamos en modo mock, actualizar los datos localmente
        if (editingMatch) {
          const updatedMatches = matches.map(m => 
            m.id === editingMatch.id 
              ? {
                  ...m,
                  date: formData.date,
                  time: formData.time,
                  status: formData.status,
                  player1: {
                    name: formData.player1Name,
                    club: formData.player1Club,
                  },
                  player2: {
                    name: formData.player2Name,
                    club: formData.player2Club,
                  },
                  score1: formData.score1 ? parseInt(formData.score1) : undefined,
                  score2: formData.score2 ? parseInt(formData.score2) : undefined,
                  sets: formData.sets || undefined,
                  photoUrl: formData.photoUrl || undefined,
                  tournamentId: formData.tournamentId || undefined,
                }
              : m
          );
          setMatches(updatedMatches);
        } else {
          // Nuevo partido - agregar a la lista
          const newMatch: Match = {
            id: data.id || Date.now().toString(),
            date: formData.date,
            time: formData.time,
            status: formData.status,
            player1: {
              name: formData.player1Name,
              club: formData.player1Club,
            },
            player2: {
              name: formData.player2Name,
              club: formData.player2Club,
            },
            score1: formData.score1 ? parseInt(formData.score1) : undefined,
            score2: formData.score2 ? parseInt(formData.score2) : undefined,
            sets: formData.sets || undefined,
            photoUrl: formData.photoUrl || undefined,
            tournamentId: formData.tournamentId || undefined,
          };
          setMatches([...matches, newMatch]);
        }
        
        alert(editingMatch ? 'Partido actualizado' : 'Partido creado');
        setShowModal(false);
        resetForm();
        // No necesitamos fetchMatches aquí porque ya actualizamos el estado localmente
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el partido');
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error al guardar el partido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    // Use rawDate for form if available, otherwise use date
    const dateValue = match.rawDate || match.date;
    // Convert display date to ISO format if needed
    const formDate = dateValue.includes('-') ? dateValue.split('T')[0] : dateValue;
    
    setFormData({
      date: formDate,
      time: match.time,
      status: match.status,
      player1Name: match.player1.name,
      player1Club: match.player1.club,
      player2Name: match.player2.name,
      player2Club: match.player2.club,
      score1: match.score1?.toString() || '',
      score2: match.score2?.toString() || '',
      sets: match.sets || '',
      photoUrl: match.photoUrl || '',
      tournamentId: match.tournamentId || '',
    });
    setMatchPhotoPreview(match.photoUrl || '');
    setMatchPhotoFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingMatch(null);
    setFormData({
      date: '',
      time: '',
      status: 'pendiente',
      player1Name: '',
      player1Club: '',
      player2Name: '',
      player2Club: '',
      score1: '',
      score2: '',
      sets: '',
      photoUrl: '',
      tournamentId: selectedTournamentId || '', // Mantener el torneo seleccionado si existe
    });
    setMatchPhotoFile(null);
    setMatchPhotoPreview('');
  };

  // Mostrar loading mientras verifica autenticación
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Verificando acceso...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Panel de Administración</h1>
        </div>

        {/* Vista: Lista de Torneos */}
        {viewMode === 'list' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Gestionar Torneos</h2>
              <button
                onClick={() => {
                  resetTournamentForm();
                  setShowTournamentModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                + Nuevo Torneo
              </button>
            </div>

            {tournaments.length === 0 ? (
              <p className="text-gray-500">No hay torneos registrados.</p>
            ) : (
              <div className="space-y-4">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{tournament.name}</h3>
                        <div className="text-lg text-gray-700 mb-2">
                          {tournament.dates.join(' • ')}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {tournament.club1}
                          </span>
                          <span className="text-gray-400 font-semibold">VS</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {tournament.club2}
                          </span>
                        </div>
                        {tournament.description && (
                          <p className="text-sm text-gray-600 mt-2">{tournament.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTournament(tournament)}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                          Gestionar Torneo
                        </button>
                        <button
                          onClick={() => {
                            setEditingTournament(tournament);
                            setTournamentFormData({
                              name: tournament.name,
                              dates: tournament.dates.length > 0 ? tournament.dates : [''],
                              club1: tournament.club1,
                              club2: tournament.club2,
                              description: tournament.description || '',
                            });
                            setShowTournamentModal(true);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          Editar Info
                        </button>
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista: Edición de Torneo */}
        {viewMode === 'edit' && editingTournament && (
          <div>
            {/* Header con botón volver */}
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 mb-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver a Torneos
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{editingTournament.name}</h2>
                  <p className="text-sm text-gray-600">{editingTournament.dates.join(' • ')}</p>
                </div>
                <button
                  onClick={() => {
                    setTournamentFormData({
                      name: editingTournament.name,
                      dates: editingTournament.dates.length > 0 ? editingTournament.dates : [''],
                      club1: editingTournament.club1,
                      club2: editingTournament.club2,
                      description: editingTournament.description || '',
                    });
                    setShowTournamentModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Editar Información
                </button>
              </div>
            </div>

            {/* Tabs dentro de la edición del torneo */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setTournamentTab('jugadores')}
                className={`px-6 py-3 border-b-2 transition-colors font-medium ${
                  tournamentTab === 'jugadores'
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Jugadores
              </button>
              <button
                onClick={() => setTournamentTab('partidos')}
                className={`px-6 py-3 border-b-2 transition-colors font-medium ${
                  tournamentTab === 'partidos'
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Partidos
              </button>
            </div>

            {/* Tab Content: Jugadores */}
            {tournamentTab === 'jugadores' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Gestionar Jugadores</h3>
                  <p className="text-sm text-gray-600">
                    Los jugadores se agregan automáticamente al crear partidos
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {filteredPlayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {player.photoUrl && (
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                <img
                                  src={player.photoUrl}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{player.name}</p>
                              <p className="text-sm text-gray-600">{player.club}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPlayer(player)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No hay jugadores registrados para este torneo.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Los jugadores aparecerán automáticamente cuando agregues partidos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content: Partidos */}
            {tournamentTab === 'partidos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Gestionar Partidos</h3>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    + Nuevo Partido
                  </button>
                </div>

                {isLoading ? (
                  <p className="text-gray-500">Cargando...</p>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No hay partidos registrados para este torneo.</p>
                  </div>
                ) : (
                  <div>
                    {/* Tabs de Fechas */}
                    <div className="mb-6">
                      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                        <button
                          onClick={() => {
                            setActiveDateTab('nov-9');
                            setActiveMatchTypeTab('proximos');
                          }}
                          className={`px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap ${
                            activeDateTab === 'nov-9'
                              ? 'border-black text-gray-900'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Nov 9
                        </button>
                        <button
                          onClick={() => {
                            setActiveDateTab('nov-10');
                            setActiveMatchTypeTab('proximos');
                          }}
                          className={`px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap ${
                            activeDateTab === 'nov-10'
                              ? 'border-black text-gray-900'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Nov 10
                        </button>
                      </div>
                    </div>

                    {/* Contenido según Tab de Fecha */}
                    <div>
                      {/* Sub-tabs para Próximos Partidos y Partidos Finalizados */}
                      <div className="mb-6">
                        <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                          <button
                            onClick={() => setActiveMatchTypeTab('proximos')}
                            className={`px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap flex items-center gap-2 ${
                              activeMatchTypeTab === 'proximos'
                                ? 'border-black text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
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
                            Próximos Partidos
                          </button>
                          <button
                            onClick={() => setActiveMatchTypeTab('finalizados')}
                            className={`px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap flex items-center gap-2 ${
                              activeMatchTypeTab === 'finalizados'
                                ? 'border-black text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
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
                            Partidos Finalizados
                          </button>
                        </div>
                      </div>

                      {/* Contenido según el tab activo */}
                      {activeMatchTypeTab === 'proximos' ? (
                        <div>
                          {currentAdminMatchesData.pendientes.length > 0 ? (
                            <div className="space-y-4">
                              {currentAdminMatchesData.pendientes.map((match) => (
                                <div
                                  key={match.id}
                                  className="bg-white border border-gray-200 rounded-lg p-6"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-4 mb-2">
                                        <p className="font-semibold text-gray-900">
                                          {match.player1.name} ({match.player1.club})
                                        </p>
                                        <span className="text-gray-400">VS</span>
                                        <p className="font-semibold text-gray-900">
                                          {match.player2.name} ({match.player2.club})
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {match.time}
                                      </p>
                                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        Pendiente
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          const matchWithFinalizado = { ...match, status: 'finalizado' as const };
                                          handleEdit(matchWithFinalizado);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                      >
                                        Agregar Resultado
                                      </button>
                                      <button
                                        onClick={() => handleEdit(match)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                      >
                                        Editar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-gray-500">No hay partidos pendientes para esta fecha.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {currentAdminMatchesData.finalizados.length > 0 ? (
                            <div className="space-y-4">
                              {currentAdminMatchesData.finalizados.map((match) => (
                                <div
                                  key={match.id}
                                  className="bg-white border border-gray-200 rounded-lg p-6"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-4 mb-2">
                                        <p className="font-semibold text-gray-900">
                                          {match.player1.name} ({match.player1.club})
                                        </p>
                                        <span className="text-gray-400">VS</span>
                                        <p className="font-semibold text-gray-900">
                                          {match.player2.name} ({match.player2.club})
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {match.time}
                                      </p>
                                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                        Finalizado
                                      </span>
                                      {match.score1 !== undefined && match.score2 !== undefined && (
                                        <div className="mt-3 flex items-center gap-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900">{match.score1}</span>
                                            <span className="text-gray-400">-</span>
                                            <span className="text-lg font-bold text-gray-900">{match.score2}</span>
                                          </div>
                                          {match.sets && (
                                            <span className="text-sm text-gray-600">({match.sets})</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEdit(match)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                      >
                                        Editar Resultado
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-gray-500">No hay partidos finalizados para esta fecha aún.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal de Jugador */}
        {showPlayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}
              </h2>
              <form onSubmit={handlePlayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Jugador
                  </label>
                  <input
                    type="text"
                    value={playerFormData.name}
                    onChange={(e) =>
                      setPlayerFormData({ ...playerFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club
                  </label>
                  <input
                    type="text"
                    value={playerFormData.club}
                    onChange={(e) =>
                      setPlayerFormData({ ...playerFormData, club: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ej: Asturiano"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto del Jugador (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePlayerPhotoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  {(playerPhotoPreview || playerFormData.photoUrl) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={playerPhotoPreview || playerFormData.photoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerPhotoPreview('');
                          setPlayerPhotoFile(null);
                          setPlayerFormData({ ...playerFormData, photoUrl: '' });
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Eliminar foto
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlayerModal(false);
                      resetPlayerForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {editingPlayer ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Torneo */}
        {showTournamentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h2>
              <form onSubmit={handleTournamentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Torneo
                  </label>
                  <input
                    type="text"
                    value={tournamentFormData.name}
                    onChange={(e) =>
                      setTournamentFormData({ ...tournamentFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Ej: Dual Meet Asturiano Vs Hacienda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fechas del Torneo
                  </label>
                  <div className="space-y-2">
                    {tournamentFormData.dates.map((date, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => updateDateField(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Ej: Nov 9 - 2025"
                          required
                        />
                        {tournamentFormData.dates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDateField(index)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDateField}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Agregar Fecha
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Club 1
                    </label>
                    <input
                      type="text"
                      value={tournamentFormData.club1}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, club1: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Club 2
                    </label>
                    <input
                      type="text"
                      value={tournamentFormData.club2}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, club2: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={tournamentFormData.description}
                    onChange={(e) =>
                      setTournamentFormData({ ...tournamentFormData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={3}
                    placeholder="Descripción del torneo..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTournamentModal(false);
                      resetTournamentForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {editingTournament ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mostrar Resultados primero cuando el estado es finalizado o cuando estamos editando un partido finalizado */}
                {formData.status === 'finalizado' && (
                  <div className="border-2 border-black rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Resultados del Partido</h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-base font-semibold text-gray-700 mb-3">
                          {formData.player1Name || 'Jugador 1'}
                        </p>
                        <input
                          type="number"
                          value={formData.score1}
                          onChange={(e) =>
                            setFormData({ ...formData, score1: e.target.value })
                          }
                          className="w-full text-center text-4xl font-bold px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="0"
                          min="0"
                          required={formData.status === 'finalizado'}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-gray-700 mb-3">
                          {formData.player2Name || 'Jugador 2'}
                        </p>
                        <input
                          type="number"
                          value={formData.score2}
                          onChange={(e) =>
                            setFormData({ ...formData, score2: e.target.value })
                          }
                          className="w-full text-center text-4xl font-bold px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="0"
                          min="0"
                          required={formData.status === 'finalizado'}
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-300 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado del Partido
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'pendiente' | 'finalizado';
                          setFormData({
                            ...formData,
                            status: newStatus,
                            // Si cambia a pendiente, limpiar las puntuaciones
                            ...(newStatus === 'pendiente' ? { score1: '', score2: '', sets: '' } : {}),
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.status === 'pendiente' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'pendiente' | 'finalizado';
                        setFormData({
                          ...formData,
                          status: newStatus,
                          // Si cambia a finalizado, inicializar puntuaciones en 0
                          ...(newStatus === 'finalizado' ? { score1: '0', score2: '0' } : {}),
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Partido</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Torneo
                    </label>
                    <select
                      value={formData.tournamentId}
                      onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      <option value="">Selecciona un torneo</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>
                          {tournament.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jugador 1 - Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.player1Name}
                      onChange={(e) =>
                        setFormData({ ...formData, player1Name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jugador 1 - Club
                    </label>
                    <input
                      type="text"
                      value={formData.player1Club}
                      onChange={(e) =>
                        setFormData({ ...formData, player1Club: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jugador 2 - Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.player2Name}
                      onChange={(e) =>
                        setFormData({ ...formData, player2Name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jugador 2 - Club
                    </label>
                    <input
                      type="text"
                      value={formData.player2Club}
                      onChange={(e) =>
                        setFormData({ ...formData, player2Club: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto del Partido (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMatchPhotoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  {(matchPhotoPreview || formData.photoUrl) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <div className="w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={matchPhotoPreview || formData.photoUrl}
                          alt="Preview"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchPhotoPreview('');
                          setMatchPhotoFile(null);
                          setFormData({ ...formData, photoUrl: '' });
                        }}
                        className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Eliminar foto
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Guardando...' : editingMatch ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
