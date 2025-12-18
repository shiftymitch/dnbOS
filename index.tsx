import { EVENTS, SYSTEM_SPECS } from './eventData.js';

interface Track {
  title: string;
  artist: string;
  duration: string;
  bitrate: string;
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
const mediaDeck = document.getElementById('media-deck') as HTMLElement;
const audioDeckContent = document.getElementById('audio-deck-content') as HTMLElement;
const bpmCounter = document.getElementById('bpm-counter') as HTMLElement;

// --- State ---
let isProcessing = false;
let currentBpm = 174.0;

let playlist: Track[] = [];
let currentTrackIndex = 0;
let isPlaying = false;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Spotify Web API Integration (Simulated via Gemini) ---
async function fetchSpotifyPlaylist() {
  addTerminalLine("SPOTIFY_API: INITIATING_OAUTH_HANDSHAKE...", "system");
  
  try {
    const lineupContext = EVENTS.flatMap(e => e.lineup).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 5 legendary Drum & Bass tracks related to this artist lineup: ${lineupContext}. Output must be in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              duration: { type: Type.STRING },
              bitrate: { type: Type.STRING },
            },
            required: ["title", "artist", "duration", "bitrate"]
          }
        }
      }
    });

    playlist = JSON.parse(response.text);
    addTerminalLine(`SPOTIFY_API: SYNC_COMPLETE. ${playlist.length} TRACKS BUFFERED.`, "success");
    renderAudioDeck();
  } catch (error) {
    console.error("Audio Sync Failed", error);
    addTerminalLine("ERROR: SPOTIFY_API_CONNECTION_REFUSED", "error");
    // Fallback playlist
    playlist = [
      { title: "The Nine", artist: "Bad Company UK", duration: "7:03", bitrate: "320kbps" },
      { title: "Messiah", artist: "Konflict", duration: "7:51", bitrate: "320kbps" }
    ];
    renderAudioDeck();
  }
}

function renderAudioDeck() {
  if (playlist.length === 0) return;
  const track = playlist[currentTrackIndex];
  
  audioDeckContent.innerHTML = `
    <div class="flex items-center space-x-4">
      <div class="w-16 h-16 bg-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center relative">
        <div class="text-[8px] absolute top-1 left-1 opacity-50">PCM</div>
        <div class="text-xl font-bold text-[#00ff41] flicker">${isPlaying ? '▶' : '||'}</div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">Now Streaming_</div>
        <div class="text-lg font-bold text-white truncate leading-tight">${track.title}</div>
        <div class="text-xs text-[#00ff41]/60 truncate uppercase">${track.artist}</div>
      </div>
    </div>
    
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] font-mono text-[#00ff41]/40 uppercase">
        <span>${track.bitrate}</span>
        <span>44.1khz / stereo</span>
        <span>${track.duration}</span>
      </div>
      <div class="h-12 w-full flex items-end justify-between border-b border-[#00ff41]/20 pb-1" id="frequency-analyzer">
        ${Array.from({ length: 40 }).map(() => `<div class="bar" style="height: ${Math.random() * 100}%"></div>`).join('')}
      </div>
    </div>

    <div class="flex justify-between items-center gap-2">
      <div class="flex gap-2">
        <button id="deck-prev" class="px-3 py-1 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 text-[10px] font-mono uppercase">PREV</button>
        <button id="deck-play" class="px-6 py-1 border border-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/30 text-[10px] font-mono uppercase font-bold">${isPlaying ? 'PAUSE' : 'PLAY'}</button>
        <button id="deck-next" class="px-3 py-1 border border-[#00ff41]/30 hover:bg-[#00ff41]/10 text-[10px] font-mono uppercase">NEXT</button>
      </div>
      <div class="text-[10px] font-mono text-cyan-400 opacity-70">BUF_LEVEL: 100%</div>
    </div>
  `;

  // Bind controls
  document.getElementById('deck-play')?.addEventListener('click', togglePlayback);
  document.getElementById('deck-next')?.addEventListener('click', () => changeTrack(1));
  document.getElementById('deck-prev')?.addEventListener('click', () => changeTrack(-1));

  if (isPlaying) startAnalyzerAnimation();
}

function togglePlayback() {
  isPlaying = !isPlaying;
  addTerminalLine(`AUDIO_DECK: ${isPlaying ? 'RESUMING_STREAM' : 'STREAM_SUSPENDED'}`, "system");
  renderAudioDeck();
}

function changeTrack(dir: number) {
  currentTrackIndex = (currentTrackIndex + dir + playlist.length) % playlist.length;
  addTerminalLine(`AUDIO_DECK: SKIPPING_TO_NODE_${currentTrackIndex}`, "system");
  renderAudioDeck();
}

let analyzerInterval: number | null = null;
function startAnalyzerAnimation() {
  if (analyzerInterval) clearInterval(analyzerInterval);
  const bars = document.querySelectorAll('.bar');
  analyzerInterval = window.setInterval(() => {
    if (!isPlaying) {
      clearInterval(analyzerInterval!);
      return;
    }
    bars.forEach(bar => {
      const h = Math.random() * 100;
      (bar as HTMLElement).style.height = `${h}%`;
    });
  }, 100);
}

// --- Boot Sequence ---
async function startBoot() {
  // Reset UI State for reboots
  mainUI.classList.add('hidden-ui');
  mainUI.classList.remove('meltdown');
  bootScreen.classList.remove('hidden-ui');
  bootLogs.innerHTML = '';
  terminalOutput.innerHTML = '';
  currentBpm = 174;
  
  const logs = [
    "dnbOS ROM BIOS v1.0",
    "Copyright (C) 2025 dnbOS",
    `CPU: ${SYSTEM_SPECS.cpu}`,
    `RAM: ${SYSTEM_SPECS. ram} ... OK`,
    "Detecting Mass Storage Devices...",
    "Primary Master: BASS-DRIVE-500GB",
    "Initializing Neural Audio Subsystem...",
    "Handshaking with Spotify Web API...",
    "Memory Test:  1048576K OK",
    `Loading Kernel ${SYSTEM_SPECS.kernel}...`,
    "Mounting /dev/drums",
    "Mounting /dev/bass",
    "Synchronizing Clock to 174 BPM",
    "Initializing User Interface...",
    "READY."
  ];

  for (const log of logs) {
    const p = document.createElement('div');
    p.className = 'animate-pulse';
    p.textContent = `[${new Date().toLocaleTimeString()}] ${log}`;
    bootLogs.appendChild(p);
    await new Promise(r => setTimeout(r, Math.random() * 80 + 40));
  }

  await new Promise(r => setTimeout(r, 500));
  bootScreen.classList.add('hidden-ui');
  mainUI.classList.remove('hidden-ui');
  initializeMain();
  fetchSpotifyPlaylist();
}

// --- Meltdown Logic ---
async function triggerMeltdown(invalidValue:  string) {
  isProcessing = true;
  isPlaying = false;
  mainUI.classList.add('meltdown');
  addTerminalLine(`CRITICAL:  CLOCK_OUT_OF_SYNC (${invalidValue} BPM)`, 'error');
  addTerminalLine("ERROR: PARITY_BIT_MISMATCH", 'error');
  addTerminalLine("WARNING: CORE_TEMPERATURE_CRITICAL", 'error');
  addTerminalLine("FATAL: KERNEL_PANIC_DNB_RTOS", 'error');

  // Flood terminal
  const flood = setInterval(() => {
    addTerminalLine(`STACK_DUMP: 0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`, 'error');
  }, 50);

  await new Promise(r => setTimeout(r, 2500));
  clearInterval(flood);
  isProcessing = false;
  startBoot(); 
}

// --- BPM Management ---
function handleBpmChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const val = parseFloat(input.value);
  
  // Valid ranges: 172-176 OR 86-88
  const isValid = (val >= 172 && val <= 176) || (val >= 86 && val <= 88);

  if (! isValid) {
    triggerMeltdown(input.value);
  } else {
    currentBpm = val;
    addTerminalLine(`CLOCK_ADJUSTED: ${val} BPM`, 'success');
    if (bpmCounter) bpmCounter.textContent = `${val} BPM`;
    renderHeader(); 
  }
}

// --- Terminal Logic ---
function addTerminalLine(text: string, type = 'info') {
  const line = document.createElement('div');
  const colors:  Record<string, string> = {
    error: 'text-red-500',
    success: 'text-cyan-400',
    system: 'text-[#00ff41]',
    input: 'text-white',
    info: 'text-gray-400'
  };
  line.className = colors[type] || '';
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput. scrollHeight;
}

async function handleTerminalSubmit(e:  Event) {
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
    addTerminalLine('- pause:  Pause audio playback', 'info');
    addTerminalLine('- clear:  Flush terminal memory', 'info');
    addTerminalLine('- status:  Diagnostics', 'info');
    addTerminalLine('- reboot: Manual system reset', 'info');
    isProcessing = false;
  } else if (userCommand === 'reboot') {
    startBoot();
  } else if (userCommand === 'clear') {
    terminalOutput.innerHTML = '';
    isProcessing = false;
  } else if (userCommand === 'status') {
    addTerminalLine(`SYSTEM: NOMINAL | BPM: ${currentBpm} | TEMP: 32C`, 'success');
    isProcessing = false;
  } else if (userCommand === 'audio') {
    mediaDeck.classList.toggle('hidden');
    addTerminalLine(`DECK_01_VISIBILITY: ${mediaDeck. classList.contains('hidden') ? 'OFF' : 'ON'}`, 'system');
    isProcessing = false;
  } else if (userCommand === 'play') {
    if (spotifyEmbed) {
      spotifyEmbed.play();
      addTerminalLine('SIGNAL_SENT:  PLAYBACK_INITIATED', 'success');
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
    isProcessing = false;
  } else if (userCommand === 'events') {
    addTerminalLine('INITIATING_REMOTE_SYNC_REQUEST...', 'system');
    await syncEvents();
    isProcessing = false;
  } else {
    addTerminalLine(`ERROR: COMMAND "${input. toUpperCase()}" NOT FOUND.`, 'error');
    isProcessing = false;
  }
}

// --- Sync & Render Helpers ---
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
    { msg: "OPENING_SOCKET:  174.174.0.1:8080", progress: 10 },
    { msg: "HANDSHAKE_SUCCESSFUL (AES-256)", progress: 25 },
    { msg: "DOWNLOADING_SECTOR_SLC_MANIFEST.. .", progress: 40 },
    { msg: "INTEGRITY_CHECK:  PASS", progress: 55 },
    { msg: `DECRYPTING:  ${EVENTS[0].title}... `, progress: 70 },
    { msg: `DECRYPTING: ${EVENTS[1]. title}...`, progress: 85 },
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
            <p class="text-xs text-[#00ff41]/60 font-mono uppercase">Support Lineup: </p>
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
              : `<a href="${event.ticketUrl}" target="_blank" class="px-6 py-2 font-mono text-sm uppercase tracking-widest bg-transparent text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors">GET ACCESS</a>`
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
    { label: 'CPU', value:  SYSTEM_SPECS.cpu },
    { label: 'NET', value: SYSTEM_SPECS.network },
    { label: 'SEC', value: 'ENCRYPTED' },
    { label: 'BPM', value: `<input type="number" step="1" class="bpm-input" value="${currentBpm}" id="bpm-editor">` }
  ];
  specsHeader.innerHTML = specs.map(s => `
    <div class="flex items-center space-x-2">
      <span class="text-[#00ff41]/40">[${s.label}]</span>
      <span>${s.value}</span>
    </div>
  `).join('');
  
  const editor = document.getElementById('bpm-editor') as HTMLInputElement;
  if (editor) {
    editor.addEventListener('blur', handleBpmChange);
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        editor.blur();
      }
    });
  }
}

// --- Initialization ---
function initializeMain() {
  renderHeader();
  syncEvents();
  bulletinText. textContent = "Boot sequence complete. You're connected to dnbOS — a live feed of Drum & Bass events and activity in Salt Lake City.";
  
  addTerminalLine('dnbOS [Version 1.0]', 'info');
  addTerminalLine('(c) 2025 dnbOS.  All rights reserved.', 'info');
  addTerminalLine('');
  addTerminalLine('Type "help" for a list of system commands. ', 'success');
  
  terminalForm.addEventListener('submit', handleTerminalSubmit);
}

// Start
startBoot();
