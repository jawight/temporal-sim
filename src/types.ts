export interface Worker {
  id: number;
}
export function nextPastel(seed: number) { 
  return `hsl(${(seed * 30) % 360}, 70%, 80%)`; 
}

export interface Workflow {
  id: number;
  color: string;
  activities: TemporalActivity[];
  taskQueue: string[][];
  workers: Worker[];
}

export interface TemporalActivity {
  id: number;
  color: string;
}
