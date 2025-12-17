
import { EVENTS, SYSTEM_SPECS } from './eventData.js';
import { gemini } from './ai.js';

// --- UI Elements ---
const bootScreen = document.getElementById('boot-screen');
const bootLogs = document.getElementById('boot-logs');
const mainUI = document.getElementById('main-ui');
const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
const eventList = document.getElementById('event-list');
const specsHeader = document.getElementById('system-specs-header');
const bulletinText = document.getElementById('bulletin-text');

// --- State ---
let isProcessing = false;

// --- Boot Sequence ---
async function startBoot() {
  const logs = [
    "dnbOS ROM BIOS v1.0",
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
    await new Promise(r => setTimeout(r, Math.random() * 150 + 50));
  }

  await new Promise(r => setTimeout(r, 800));
  bootScreen.classList.add('hidden-ui');
  mainUI.classList.remove('hidden-ui');
  initializeMain();
}

// --- Terminal Logic ---
function addTerminalLine(text, type = 'info') {
  const line = document.createElement('div');
  const colors = {
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

async function handleTerminalSubmit(e) {
  e.preventDefault();
  const input = terminalInput.value.trim();
  if (!input || isProcessing) return;

  const userCommand = input.toLowerCase();
  addTerminalLine(`guest@dnbos:~$ ${input}`, 'input');
  terminalInput.value = '';
  isProcessing = true;

  if (userCommand === 'help') {
    addTerminalLine('AVAILABLE COMMANDS:', 'success');
    addTerminalLine('- events: List names and dates of all upcoming operations', 'info');
    addTerminalLine('- clear: Purge terminal buffer', 'info');
    addTerminalLine('- status: Check system health', 'info');
    addTerminalLine('- help: Display this help matrix', 'info');
    addTerminalLine('- [Question]: Query DNBIOS Neural Net (Restricted)', 'info');
    isProcessing = false;
  } else if (userCommand === 'clear') {
    terminalOutput.innerHTML = '';
    isProcessing = false;
  } else if (userCommand === 'status') {
    addTerminalLine('SYSTEM: OK | BPM: 174 | BASS_LOAD: 98% | TEMP: NOMINAL', 'success');
    isProcessing = false;
  } else if (userCommand === 'events') {
    addTerminalLine('READING_DIRECTORY: /usr/bin/events...', 'system');
    setTimeout(() => {
      EVENTS.forEach(event => {
        addTerminalLine(`> ${event.date} | ${event.title}`, 'info');
      });
      addTerminalLine(`TOTAL_ENTRIES_FOUND: ${EVENTS.length}`, 'success');
      isProcessing = false;
    }, 400);
  } else {
    addTerminalLine('dnbOS is thinking...', 'system');
    const response = await gemini.querySystem(input);
    if (terminalOutput.lastChild) {
      terminalOutput.lastChild.remove();
    }
    addTerminalLine(response, 'system');
    isProcessing = false;
  }
}

// --- Render Helpers ---
function renderEvents() {
  eventList.innerHTML = EVENTS.map(event => {
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
            <p class="text-xs text-[#00ff41]/60 font-mono uppercase">Decrypted Lineup:</p>
            <div class="flex flex-wrap gap-2">
              ${event.lineup.map(artist => `
                <span class="bg-[#00ff41]/10 text-[#00ff41] px-2 py-1 text-xs border border-[#00ff41]/30">${artist}</span>
              `).join('')}
            </div>
          </div>
          <p class="text-gray-400 text-sm italic">&gt; ${event.description}</p>
          <div class="pt-4 flex items-center justify-between border-t border-[#00ff41]/10">
            <div class="text-lg font-bold text-white font-mono">${isSoldOut ? 'TERMINATED' : event.price}</div>
            <button ${isSoldOut ? 'disabled' : ''} class="px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all ${isSoldOut ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-transparent text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black shadow-[0_0_10px_rgba(0,255,65,0.2)]'}">
              ${isSoldOut ? 'SOLD OUT' : 'INITIATE PURCHASE'}
            </button>
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
  bulletinText.textContent = "Attention all units: Critical density predicted at Sector SLC Metro Hall for Neural Networks Vol 1. Ensure parity bits are synchronized to 174BPM. Audio artifacts are expected.";
  
  addTerminalLine('dnbOS [Version 2.5.0-flash]', 'info');
  addTerminalLine('(c) 2025 Sector SLC Intelligence. All rights reserved.', 'info');
  addTerminalLine('');
  addTerminalLine('Type "help" for a list of system commands.', 'success');
  
  terminalForm.addEventListener('submit', handleTerminalSubmit);
}

// Start
startBoot();
