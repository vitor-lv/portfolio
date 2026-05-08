export interface Task {
  id: string;
  week_id: string;
  text: string;
  done: boolean;
  icon?: string;
}

export interface Ritual {
  id: string;
  week_id: string;
  date: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  analysis: string;
}

export interface KeyResult {
  id: string;
  text: string;
  progress: number;
  notas: string;
}

export interface Objective {
  id: string;
  titulo: string;
  prazo: string;
  krs: KeyResult[];
}

