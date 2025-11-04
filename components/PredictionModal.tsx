'use client';

import { useState } from 'react';
import { Match } from '@/lib/db';

interface PredictionModalProps {
  match: Match;
}

export default function PredictionModal({ match }: PredictionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [prediction, setPrediction] = useState<'player1' | 'player2' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !prediction) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          predictedWinner: prediction,
          userName,
        }),
      });

      if (response.ok) {
        alert('Predicción guardada exitosamente');
        setIsOpen(false);
        setUserName('');
        setPrediction(null);
      } else {
        alert('Error al guardar la predicción');
      }
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Error al guardar la predicción');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Hacer Predicción
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hacer Predicción</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Quién ganará?
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPrediction('player1')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      prediction === 'player1'
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{match.player1.name}</p>
                    <p className="text-sm text-gray-600">{match.player1.club}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrediction('player2')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      prediction === 'player2'
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{match.player2.name}</p>
                    <p className="text-sm text-gray-600">{match.player2.club}</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!userName || !prediction || isSubmitting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
