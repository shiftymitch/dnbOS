
import React, { useState, useEffect } from 'react';
import { BootPhase } from '../types';
import { SYSTEM_SPECS } from '../constants';

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<BootPhase>(BootPhase.INITIAL);

  useEffect(() => {
    const sequence = async () => {
      const addLog = (msg: string, delay: number) => 
        new Promise<void>(res => setTimeout(() => {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
          res();
        }, delay));

      await addLog("dnbOS ROM BIOS v1.0", 200);
      await addLog("Copyright (C) 2025 dnbOS", 100);
      await addLog("CPU: " + SYSTEM_SPECS.cpu, 300);
      await addLog("RAM: " + SYSTEM_SPECS.ram + " ... OK", 500);
      await addLog("Detecting Mass Storage Devices...", 400);
      await addLog("Primary Master: BASS-DRIVE-500GB", 200);
      await addLog("Secondary Master: AMEN-BREAK-CDROM", 200);
      
      setPhase(BootPhase.MEMORY_CHECK);
      await addLog("Memory Test: 1048576K OK", 800);
      
      setPhase(BootPhase.KERNEL_LOAD);
      await addLog("Loading Kernel " + SYSTEM_SPECS.kernel + "...", 600);
      await addLog("Mounting /dev/drums", 300);
      await addLog("Mounting /dev/bass", 300);
      
      setPhase(BootPhase.BPM_SYNC);
      await addLog("Synchronizing Clock to 174.00 BPM", 1000);
      await addLog("Initializing User Interface...", 400);
      await addLog("READY.", 500);
      
      setTimeout(onComplete, 1000);
    };

    sequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black text-[#00ff41] p-8 z-50 overflow-hidden font-mono text-sm md:text-base">
      <div className="max-w-4xl mx-auto space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="animate-pulse">
            {log}
          </div>
        ))}
        {phase !== BootPhase.COMPLETED && (
          <div className="flex items-center space-x-2">
            <span className="animate-ping">_</span>
            <span className="text-gray-500 italic">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BootSequence;

