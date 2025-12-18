
import React from 'react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isSoldOut = event.status === 'SOLD_OUT';

  return (
    <div className="relative group overflow-hidden border border-[#00ff41]/20 bg-black/50 hover:border-[#00ff41]/60 transition-all duration-300 p-6 rounded-sm">
      <div className="absolute top-0 right-0 p-2 text-[10px] text-[#00ff41]/50 font-mono">
        ID: {event.id}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-[#00ff41] tracking-wider mb-1">
            {event.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm font-mono text-cyan-400">
            <span>{event.date}</span>
            <span className="text-gray-600">|</span>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-[#00ff41]/60 font-mono uppercase">Support Lineup:</p>
          <div className="flex flex-wrap gap-2">
            {event.lineup.map((artist, idx) => (
              <span key={idx} className="bg-[#00ff41]/10 text-[#00ff41] px-2 py-1 text-xs border border-[#00ff41]/30">
                {artist}
              </span>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-sm italic">
          &gt; {event.description}
        </p>

        <div className="pt-4 flex items-center justify-between border-t border-[#00ff41]/10">
          <div className="text-lg font-bold text-white font-mono">
            {isSoldOut ? 'MEMORY FULL' : event.price}
          </div>
          <button
            disabled={isSoldOut}
            className={`
              px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all
              ${isSoldOut 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                : 'bg-transparent text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black shadow-[0_0_10px_rgba(0,255,65,0.2)]'
              }
            `}
          >
            {isSoldOut ? 'SOLD OUT' : 'INITIATE PURCHASE'}
          </button>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41]/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff41]/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff41]/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41]/50" />
    </div>
  );
};

export default EventCard;
