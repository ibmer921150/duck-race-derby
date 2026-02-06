import React from 'react';
import { RaceTheme } from './RaceCharacter';

interface ThemeSelectorProps {
  selectedTheme: RaceTheme;
  onThemeChange: (theme: RaceTheme) => void;
  disabled?: boolean;
}

const themes: { id: RaceTheme; label: string; emoji: string; bg: string }[] = [
  { id: 'duck', label: 'Duck Race', emoji: '🦆', bg: 'bg-secondary' },
  { id: 'horse', label: 'Horse Race', emoji: '🐴', bg: 'bg-green-600' },
  { id: 'car', label: 'Car Race', emoji: '🏎️', bg: 'bg-gray-700' },
  { id: 'marble', label: 'Marble Race', emoji: '🔮', bg: 'bg-purple-600' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onThemeChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground">🎨 Race Theme</label>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            disabled={disabled}
            className={`
              p-3 rounded-xl border-2 transition-all font-medium text-sm
              flex items-center gap-2 justify-center
              ${selectedTheme === theme.id 
                ? 'border-primary bg-primary/20 scale-105 shadow-lg' 
                : 'border-border hover:border-primary/50 bg-card'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-xl">{theme.emoji}</span>
            <span>{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
