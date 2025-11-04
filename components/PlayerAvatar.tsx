interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Colores vibrantes para avatares de películas
const avatarColors = [
  { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-orange-500 to-red-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-green-500 to-emerald-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-indigo-500 to-purple-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-yellow-500 to-orange-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-teal-500 to-blue-500', text: 'text-white' },
  { bg: 'bg-gradient-to-br from-pink-500 to-rose-500', text: 'text-white' },
];

export default function PlayerAvatar({ name, size = 'md', className = '' }: PlayerAvatarProps) {
  // Obtener iniciales del nombre
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Seleccionar color basado en el nombre (determinístico)
  const getColorIndex = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % avatarColors.length;
  };

  const initials = getInitials(name);
  const colorIndex = getColorIndex(name);
  const color = avatarColors[colorIndex];

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-base sm:text-lg lg:text-xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${color.bg} ${color.text} rounded-full flex items-center justify-center font-bold border-2 border-gray-200 shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
}

