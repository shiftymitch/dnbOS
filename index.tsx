import { EVENTS, SYSTEM_SPECS } from './eventData.js';

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
const mediaDeck = document.getElementById('media-deck') as HTMLElement;

// --- State ---
let isProcessing = false;
let spotifyEmbed: any = null;
let spotifyAPI: any = null;

// --- Spotify Global Hook ---
// We attach this to window immediately so the async script finds it regardless of boot progress
(window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
  spotifyAPI = IFrameAPI;
  console.log('dnbOS: Spotify API Ready');
};

// --- Spotify Player Mount ---
function mountSpotifyPlayer() {
  if (!spotifyAPI) {
    addTerminalLine('SYSTEM: WAITING_FOR_AUDIO_SUBSYSTEM...', 'info');
    setTimeout(mountSpotifyPlayer, 500);
    return;
  }

  const element = document.getElementById('spotify-player-mount');
  if (!element) {
    addTerminalLine('SYSTEM: AUDIO_MOUNT_NODE_NOT_FOUND', 'error');
    return;
  }

  const options = {
    width: '100%',
    height: '152',
    uri: 'spotify:playlist:2iLwOjiPrh9CpRyN6vfyvv?theme=0',
    allow: 'autoplay',
  };

  spotifyAPI.createController(element, options, (EmbedController: any) => {
    spotifyEmbed = EmbedController;
  });
}

// --- Boot Sequence ---
async function startBoot() {
  const logs = [
    "dnbOS ROM BIOS v1.0",
    "Copyright (C) 2025 dnbOS",
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
    "DECK_01: STANDBY",
    "READY."
  ];

  for (const log of logs) {
    const p = document.createElement('div');
    p.className = 'animate-pulse';
    p.textContent = `[${new Date().toLocaleTimeString()}] ${log}`;
    bootLogs.appendChild(p);
    await new Promise(r => setTimeout(r, Math.random() * 60 + 30));
  }

  await new Promise(r => setTimeout(r, 500));
  bootScreen.classList.add('hidden-ui');
  mainUI.classList.remove('hidden-ui');
  initializeMain();
  mountSpotifyPlayer();
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
  addTerminalLine(`guest@dnbos > ${input}`, 'input');
  terminalInput.value = '';
  isProcessing = true;

  if (userCommand === 'help') {
    addTerminalLine('SYSTEM COMMAND MATRIX:', 'success');
    addTerminalLine('- events: Re-sync and list all active operations', 'info');
    addTerminalLine('- audio: Toggle deck visibility', 'info');
    addTerminalLine('- play: Force playback start signal', 'info');
    addTerminalLine('- pause: Pause audio playback', 'info');
    addTerminalLine('- clear: Flush terminal memory', 'info');
    addTerminalLine('- status: System health diagnostics', 'info');
    isProcessing = false;
  } else if (userCommand === 'clear') {
    terminalOutput.innerHTML = '';
    isProcessing = false;
  } else if (userCommand === 'status') {
    addTerminalLine('SYSTEM: NOMINAL | BPM: 174 | LATENCY: LOW', 'success');
    isProcessing = false;
  } else if (userCommand === 'audio') {
    mediaDeck.classList.toggle('hidden');
    addTerminalLine(`DECK_01_VISIBILITY: ${mediaDeck.classList.contains('hidden') ? 'OFF' : 'ON'}`, 'system');
    isProcessing = false;
  } else if (userCommand === 'play') {
    if (spotifyEmbed) {
      spotifyEmbed.play();
      addTerminalLine('SIGNAL_SENT: PLAYBACK_INITIATED', 'success');
    } else {
      addTerminalLine('ERROR: AUDIO_INTERFACE_NOT_READY', 'error');
    }
    isProcessing = false;
  } else if (userCommand === 'pause') {
    if (spotifyEmbed) {
      spotifyEmbed.pause();
      addTerminalLine('SIGNAL_SENT: PLAYBACK_PAUSED', 'success');
    } else {
      addTerminalLine('ERROR: AUDIO_NOT_PLAYING', 'error');
    }
  } else if (userCommand === 'events') {
    addTerminalLine('INITIATING_REMOTE_SYNC_REQUEST...', 'system');
    await syncEvents();
    isProcessing = false;
  } else {
    addTerminalLine(`ERROR: COMMAND "${input.toUpperCase()}" NOT FOUND.`, 'error');
    isProcessing = false;
  }
}

// --- Render Helpers ---
async function syncEvents() {
  // Clear list and show loader
  eventList.innerHTML = `
    <div id="event-sync-container" class="space-y-4 p-8 border border-[#00ff41]/20 bg-black/40 rounded-sm font-mono text-sm">
      <div class="flex items-center justify-between border-b border-[#00ff41]/10 pb-2">
        <span class="text-[#00ff41] animate-pulse">SYNC_IN_PROGRESS</span>
        <span id="sync-percent" class="text-cyan-400">0%</span>
      </div>
      <div id="event-sync-logs" class="space-y-1 text-xs text-[#00ff41]/60"></div>
      <div class="w-full bg-[#00ff41]/5 h-1 relative overflow-hidden">
        <div id="sync-progress-bar" class="absolute top-0 left-0 h-full bg-[#00ff41] transition-all duration-300" style="width: 0%"></div>
      </div>
    </div>
  `;

  const logsContainer = document.getElementById('event-sync-logs')!;
  const progressBar = document.getElementById('sync-progress-bar')!;
  const percentLabel = document.getElementById('sync-percent')!;
  
  const steps = [
    { msg: "OPENING_SOCKET: 174.174.0.1:8080", progress: 10 },
    { msg: "HANDSHAKE_SUCCESSFUL (AES-256)", progress: 25 },
    { msg: "DOWNLOADING_SECTOR_SLC_MANIFEST...", progress: 40 },
    { msg: "INTEGRITY_CHECK: PASS", progress: 55 },
    { msg: `DECRYPTING: ${EVENTS[0].title}...`, progress: 70 },
    { msg: `DECRYPTING: ${EVENTS[1].title}...`, progress: 85 },
    { msg: "RECONSTRUCTING_DOM_STREAM...", progress: 95 },
    { msg: "SYNC_COMPLETE", progress: 100 }
  ];

  for (const step of steps) {
    const div = document.createElement('div');
    div.innerHTML = `<span class="opacity-40 mr-2">></span> ${step.msg}`;
    logsContainer.appendChild(div);
    
    progressBar.style.width = `${step.progress}%`;
    percentLabel.textContent = `${step.progress}%`;
    
    // Scroll to bottom of sync logs
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
  }
  
  await new Promise(r => setTimeout(r, 500));
  renderEvents();
}

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
            <p class="text-xs text-[#00ff41]/60 font-mono uppercase">Support Lineup:</p>
            <div class="flex flex-wrap gap-2">
              ${event.lineup.map(artist => `
                <span class="bg-[#00ff41]/10 text-[#00ff41] px-2 py-1 text-xs border border-[#00ff41]/30">${artist}</span>
              `).join('')}
            </div>
          </div>
          <p class="text-gray-400 text-sm italic">&gt; ${event.description}</p>
          <div class="pt-4 flex items-center justify-between border-t border-[#00ff41]/10">
            <div class="text-lg font-bold text-white font-mono">${isSoldOut ? 'ACCESS DENIED' : event.price + '+'}</div>
            ${isSoldOut 
              ? `<button disabled class="px-6 py-2 font-mono text-sm uppercase tracking-widest bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700">SOLD OUT</button>`
              : `<a href="${event.ticketUrl}" target="_blank" class="px-6 py-2 font-mono text-sm uppercase tracking-widest bg-transparent text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black shadow-[0_0_10px_rgba(0,255,65,0.2)] text-center">INITIATE PURCHASE</a>`
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
  syncEvents();
  bulletinText.textContent = "Boot sequence complete. You’re connected to dnbOS — a live feed of Drum & Bass events and activity in Salt Lake City.";
  
  addTerminalLine('dnbOS [Version 1.0]', 'info');
  addTerminalLine('(c) 2025 dnbOS. All rights reserved.', 'info');
  addTerminalLine('');
  addTerminalLine('Type "help" for a list of system commands.', 'success');
  
  terminalForm.addEventListener('submit', handleTerminalSubmit);
}

// Start
startBoot();
