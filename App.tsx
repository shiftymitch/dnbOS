
import React, { useState, useEffect } from 'react';
import BootSequence from './components/BootSequence';
import Terminal from './components/Terminal';
import EventCard from './components/EventCard';
// Import EventData type for casting
import { EventData } from './types';
import { EVENTS, SYSTEM_SPECS } from './eventData';
import { Cpu, Wifi, Shield, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isBooted, setIsBooted] = useState(false);

  if (!isBooted) {
    return <BootSequence onComplete={() => setIsBooted(true)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header Info Section */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#00ff41]/20 pb-4 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#00ff41] flicker">
            dnbOS<span className="text-xs align-super opacity-50 ml-1">v2.5</span>
          </h1>
          <p className="text-sm font-mono text-[#00ff41]/70 uppercase tracking-widest">
            Salt Lake City Sector // High Frequency Operations
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono uppercase text-[#00ff41]/60">
          <div className="flex items-center space-x-2">
            <Cpu size={12} />
            <span>{SYSTEM_SPECS.cpu}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi size={12} />
            <span>{SYSTEM_SPECS.network}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield size={12} />
            <span>ENCRYPTED</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap size={12} />
            <span>174 BPM</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Terminal/AI Column */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#00ff41]">
              <span>SYSTEM_CONSOL_V03</span>
              <span className="animate-pulse">ONLINE</span>
            </div>
            <Terminal />
          </div>
          
          <div className="p-4 border border-dashed border-[#00ff41]/30 rounded-sm bg-[#00ff41]/5">
            <h4 className="text-[#00ff41] text-xs font-bold mb-2 uppercase tracking-tighter flex items-center">
              <span className="w-2 h-2 bg-[#00ff41] rounded-full mr-2 animate-ping" />
              SLC Scene Bulletin
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-mono">
              Attention all units: Critical density predicted at Sector SLC Metro Hall for Neural Networks Vol 1. Ensure parity bits are synchronized to 174BPM. Audio artifacts are expected. Unauthorized signal interception will be prosecuted.
            </p>
          </div>
        </section>

        {/* Events Column */}
        <section className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between border-b border-[#00ff41]/30 pb-2">
            <h2 className="text-2xl font-bold text-[#00ff41] tracking-tight flex items-center">
              <span className="mr-2">&gt;</span> ACTIVE OPERATIONS
            </h2>
            <span className="text-xs font-mono text-[#00ff41]/50 uppercase">Directory: /usr/bin/events/</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Fix: Explicitly cast EVENTS to EventData[] to ensure the "status" field is correctly typed for the EventCard component */}
            {(EVENTS as unknown as EventData[]).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center py-10 opacity-20 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-mono text-[#00ff41] uppercase tracking-[0.5em]">
              --- End of Data Stream ---
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full max-w-6xl mt-12 pt-8 border-t border-[#00ff41]/20 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-[#00ff41]/40 uppercase tracking-widest gap-4">
          <span>&copy; 2025 dnbOS Digital Infrastructures</span>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#00ff41] transition-colors">INSTAGRAM_API</a>
            <a href="#" className="hover:text-[#00ff41] transition-colors">DISCORD_SERVER</a>
            <a href="#" className="hover:text-[#00ff41] transition-colors">SOUNDCLOUD_REPOSITORY</a>
          </div>
          <span>Built for the Underground</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
