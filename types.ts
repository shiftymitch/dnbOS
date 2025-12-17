
export interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  lineup: string[];
  description: string;
  price: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
}

export interface TerminalLine {
  text: string;
  type: 'info' | 'error' | 'success' | 'input' | 'system';
}

export enum BootPhase {
  INITIAL = 'INITIAL',
  MEMORY_CHECK = 'MEMORY_CHECK',
  KERNEL_LOAD = 'KERNEL_LOAD',
  BPM_SYNC = 'BPM_SYNC',
  COMPLETED = 'COMPLETED'
}
