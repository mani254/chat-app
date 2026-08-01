import React from 'react';

interface TypingDotsProps {
  userName?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ userName }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-sm text-slate-600 text-xs w-max animate-pulse">
      <span className="font-medium text-slate-700">
        {userName ? `${userName} is typing` : 'Typing'}
      </span>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
      </div>
    </div>
  );
};
