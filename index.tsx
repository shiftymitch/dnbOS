
import { EVENTS, SYSTEM_SPECS } from './eventData.js';

interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  lineup: string[];
  description: string;
  price: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  ticketUrl: string;
}

// --- UI Elements ---
const bootScreen = document.getElementById('boot-screen') as HTMLElement;
const bootLogs = document.getElementById('boot-logs') as HTMLElement;
const mainUI = document.getElementById('main-ui') as HTMLElement;
const terminalOutput = document.getElementById('terminal-output') as HTMLElement;
const terminalForm = document.getElementById('terminal-form') as HTMLFormElement;
const terminalInput = document.getElementById('terminal-input') as HTMLInputElement;
const eventList = document.getElementById('event-list') as HTMLElement;
const specsHeader = document.getElementById('system-specs-header') as HTMLElement;
const bulletinText = document.getElementById('bulletin-text') as HTMLElement;

// --- State ---
let isProcessing = false;

// --- Boot Sequence ---
async function startBoot() {
  const logs = [
    `dnbOS ROM BIOS v${SYSTEM_SPECS.version}`,
    "Copyright (C) 2025 dnbOS SLC",
    `CPU: ${SYSTEM_SPECS.cpu}`,
    `RAM: ${SYSTEM_SPECS.ram} ... OK`,
    "Detecting Mass Storage Devices...",
    "Primary Master: BASS-DRIVE-500GB",
    "Secondary Master: AMEN-BREAK-CDROM",
    "Memory Test: 1048576K OK",
    `Loading Kernel ${SYSTEM_SPECS.kernel}...`,
    "Mounting /dev/drums",
    "Mounting /dev/bass",
    "Synchronizing Clock to 174.00 BPM",
    "Initializing User Interface...",
    "READY."
  ];

  for (const log of logs) {
    const p = document.createElement('div');
    p.className = 'animate-pulse';
    p.textContent = `[${new Date().toLocaleTimeString()}] ${log}`;
    bootLogs.appendChild(p);
    await new Promise(r => setTimeout(r, Math.random() * 100 + 50));
  }

  await new Promise(r => setTimeout(r, 800));
  bootScreen.classList.add('hidden-ui');
  mainUI.classList.remove('hidden-ui');
  initializeMain();
}

// --- Terminal Logic ---
function addTerminalLine(text: string, type = 'info') {
  const line = document.createElement('div');
  const colors: Record<string, string> = {
    error: 'text-red-500',
    success: 'text-cyan-400',
    system: 'text-[#00ff41]',
    input: 'text-white',
    info: 'text-gray-400'
  };
  line.className = colors[type] || '';
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

async function handleTerminalSubmit(e: Event) {
  e.preventDefault();
  const input = terminalInput.value.trim();
  if (!input || isProcessing) return;

  const userCommand = input.toLowerCase();
  addTerminalLine(`guest@dnbos:~$ ${input}`, 'input');
  terminalInput.value = '';
  isProcessing = true;

  if (userCommand === 'help') {
    addTerminalLine('AVAILABLE COMMANDS:', 'success');
    addTerminalLine('- events: List upcoming dnbOS operations', 'info');
    addTerminalLine('- clear: Purge terminal buffer', 'info');
    addTerminalLine('- status: Check system health', 'info');
    addTerminalLine('- help: Display this help matrix', 'info');
    isProcessing = false;
  } else if (userCommand === 'clear') {
    terminalOutput.innerHTML = '';
    isProcessing = false;
  } else if (userCommand === 'status') {
    addTerminalLine('SYSTEM: OK | BPM: 174 | BASS_LOAD: 98% | TEMP: NOMINAL', 'success');
    isProcessing = false;
  } else if (userCommand === 'events') {
    addTerminalLine('ACCESSING /usr/bin/events...', 'system');
    setTimeout(() => {
      (EVENTS as unknown as EventData[]).forEach(event => {
        addTerminalLine(`> [${event.date}] ${event.title}`, 'info');
      });
      addTerminalLine(`SCAN_COMPLETE: ${EVENTS.length} OPERATIONS FOUND`, 'success');
      isProcessing = false;
    }, 400);
  } else {
    addTerminalLine(`ERROR: COMMAND "${input.toUpperCase()}" NOT FOUND.`, 'error');
    isProcessing = false;
  }
}

// --- Render Helpers ---
function renderEvents() {
  eventList.innerHTML = (EVENTS as unknown as EventData[]).map(event => {
    const isSoldOut = event.status === 'SOLD_OUT';
    return `
      <div class="relative group overflow-hidden border border-[#00ff41]/20 bg-black/50 hover:border-[#00ff41]/60 transition-all duration-300 p-6 rounded-sm">
        <div class="absolute top-0 right-0 p-2 text-[10px] text-[#00ff41]/50 font-mono">
          ID: ${event.id}
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="text-xl md:text-2xl font-bold text-[#00ff41] tracking-wider mb-1">${event.title}</h3>
            <div class="flex items-center space-x-4 text-sm font-mono text-cyan-400">
              <span>${event.date}</span>
              <span class="text-gray-600">|</span>
              <span>${event.location}</span>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-[#00ff41]/60 font-mono uppercase">Operational Lineup:</p>
            <div class="flex flex-wrap gap-2">
              ${event.lineup.map(artist => `
                <span class="bg-[#00ff41]/10 text-[#00ff41] px-2 py-1 text-xs border border-[#00ff41]/30">${artist}</span>
              `).join('')}
            </div>
          </div>
          <p class="text-gray-400 text-sm italic">&gt; ${event.description}</p>
          <div class="pt-4 flex items-center justify-between border-t border-[#00ff41]/10">
            <div class="text-lg font-bold text-white font-mono">${isSoldOut ? 'MEMORY FULL' : event.price}</div>
            ${isSoldOut 
              ? `<button disabled class="px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700">TERMINATED</button>`
              : `<a href="${event.ticketUrl}" target="_blank" class="px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all bg-transparent text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black shadow-[0_0_10px_rgba(0,255,65,0.2)] text-center">INITIATE PURCHASE</a>`
            }
          </div>
        </div>
        <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41]/50"></div>
        <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff41]/50"></div>
        <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff41]/50"></div>
        <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41]/50"></div>
      </div>
    `;
  }).join('');
}

function renderHeader() {
  const specs = [
    { label: 'CPU', value: SYSTEM_SPECS.cpu },
    { label: 'NET', value: SYSTEM_SPECS.network },
    { label: 'SEC', value: 'ENCRYPTED' },
    { label: 'BPM', value: '174.00' }
  ];
  specsHeader.innerHTML = specs.map(s => `
    <div class="flex items-center space-x-2">
      <span class="text-[#00ff41]/40">[${s.label}]</span>
      <span>${s.value}</span>
    </div>
  `).join('');
}

// --- Initialization ---
function initializeMain() {
  renderHeader();
  renderEvents();
  bulletinText.textContent = "Attention all units: Critical density predicted for Sector SLC operations. Ensure parity bits are synchronized to 174BPM. Audio artifacts are expected at high frequencies.";
  
  addTerminalLine(`dnbOS [Version ${SYSTEM_SPECS.version}]`, 'info');
  addTerminalLine('(c) 2025 dnbOS Digital Infrastructures. All rights reserved.', 'info');
  addTerminalLine('');
  addTerminalLine('Type "help" for available command matrix.', 'success');
  
  terminalForm.addEventListener('submit', handleTerminalSubmit);
}

// Start
startBoot();

