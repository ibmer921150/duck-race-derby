import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NameInputProps {
  names: string;
  onNamesChange: (names: string) => void;
  disabled?: boolean;
}

// Helper function to split names by multiple delimiters
const splitNames = (names: string): string[] => {
  return names
    .split(/[\n,;]+/) // Split by newline, comma, or semicolon (one or more)
    .map(n => n.trim())
    .filter(n => n.length > 0);
};

const NameInput: React.FC<NameInputProps> = ({ names, onNamesChange, disabled }) => {
  const nameCount = splitNames(names).length;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="names" className="text-lg font-bold text-foreground">
          🦆 Enter Racer Names
        </Label>
        <span className={`text-sm font-medium ${nameCount > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {nameCount} / 2000 names
        </span>
      </div>
      <Textarea
        id="names"
        placeholder="Enter names (one per line, or separated by commas or semicolons)&#10;e.g.&#10;Alice, Bob, Charlie&#10;David; Eve&#10;Frank&#10;..."
        value={names}
        onChange={(e) => onNamesChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] bg-card text-card-foreground border-2 border-secondary/30 focus:border-primary resize-y font-medium"
      />
      <p className="text-sm text-muted-foreground">
        Tip: Separate names with new lines, commas, or semicolons. Maximum 2000 racers allowed.
      </p>
    </div>
  );
};

export default NameInput;
