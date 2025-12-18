
import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '../types';

const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'dnbOS [Version 1.0.0-flash]', type: 'info' },
    { text: '(c) 2025 dnbOS. All rights reserved.', type: 'info' },
    { text: '', type: 'info' },
    { text: 'Type "help" for a list of system commands.', type: 'success' },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userCommand = input.toLowerCase().trim();
    setLines(prev => [...prev, { text: `guest@dnbos:~$ ${input}`, type: 'input' }]);
    setInput('');
    setIsProcessing(true);

    if (userCommand === 'help') {
      setLines(prev => [...prev, 
        { text: 'AVAILABLE COMMANDS:', type: 'success' },
        { text: '- events: List upcoming dnbOS operations', type: 'info' },
        { text: '- clear: Purge terminal buffer', type: 'info' },
        { text: '- status: Check system health', type: 'info' },
        { text: '- help: Display this help matrix', type: 'info' },
      ]);
      setIsProcessing(false);
    } else if (userCommand === 'clear') {
      setLines([]);
      setIsProcessing(false);
    } else if (userCommand === 'events') {
      setLines(prev => [...prev, { text: 'Scanning /usr/bin/events...', type: 'system' }]);
      setTimeout(() => {
        setLines(prev => [...prev, { text: 'Scroll down to VIEW_MOD: VISUAL for full event details.', type: 'success' }]);
        setIsProcessing(false);
      }, 500);
    } else if (userCommand === 'status') {
       setLines(prev => [...prev, { text: 'SYSTEM: OK | BPM: 174 | BASS_LOAD: 98% | TEMP: NOMINAL', type: 'success' }]);
       setIsProcessing(false);
    } else {
      setLines(prev => [...prev, { text: `ERROR: COMMAND "${input.toUpperCase()}" NOT FOUND.`, type: 'error' }]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black/80 border border-[#00ff41]/30 rounded p-4 h-[400px] flex flex-col font-mono text-sm md:text-base shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-4 scrollbar-hide">
        {lines.map((line, i) => (
          <div key={i} className={`
            ${line.type === 'error' ? 'text-red-500' : ''}
            ${line.type === 'success' ? 'text-cyan-400' : ''}
            ${line.type === 'system' ? 'text-[#00ff41]' : ''}
            ${line.type === 'input' ? 'text-white' : ''}
            ${line.type === 'info' ? 'text-gray-400' : ''}
          `}>
            {line.text}
          </div>
        ))}
        {isProcessing && <div className="animate-pulse text-[#00ff41]">Processing...</div>}
      </div>
      <form onSubmit={handleCommand} className="flex border-t border-[#00ff41]/20 pt-2">
        <span className="text-[#00ff41] mr-2">guest@dnbos > </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-gray-700"
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;
