
export type TeamSide = 'left' | 'right';

export interface Player {
  name: string;
}

export interface Team {
  name: string;
  players: [Player, Player];
}

export interface MatchSettings {
  winningPoint: number;
  sideChangePoint: number;
  teams: [Team, Team];
  initialSide: TeamSide;
  initialServerTeam: 0 | 1;
  groupName?: string; // Tên Bảng thi đấu
}

export interface MatchState {
  scores: [number, number];
  servingTeam: 0 | 1; 
  serverNumber: 1 | 2;
  teamPositions: [[number, number], [number, number]];
  isGameOver: boolean;
  visualSideSwapped: boolean; 
  autoSwapped: boolean; // New: tracking if the point-based auto swap happened
  history: MatchStateSnapshot[];
}

export interface MatchStateSnapshot {
  scores: [number, number];
  servingTeam: 0 | 1;
  serverNumber: 1 | 2;
  teamPositions: [[number, number], [number, number]];
  visualSideSwapped: boolean;
  autoSwapped: boolean;
}

export interface CompletedMatch {
  id: string;
  teams: [Team, Team];
  scores: [number, number];
  winningPoint: number;
  date: string;
  groupName?: string; // Lưu tên bảng trong lịch sử
}
