
import { MatchState, MatchStateSnapshot, MatchSettings } from './types';

export const createInitialMatchState = (initialServingTeam: 0 | 1): MatchState => {
  return {
    scores: [0, 0],
    servingTeam: initialServingTeam,
    serverNumber: 2, 
    teamPositions: [
      [0, 1], 
      [0, 1], 
    ],
    isGameOver: false,
    visualSideSwapped: false,
    autoSwapped: false,
    history: []
  };
};

const recordHistory = (state: MatchState): MatchStateSnapshot => {
  return {
    scores: [...state.scores],
    servingTeam: state.servingTeam,
    serverNumber: state.serverNumber,
    teamPositions: [
      [...state.teamPositions[0]],
      [...state.teamPositions[1]]
    ],
    visualSideSwapped: state.visualSideSwapped,
    autoSwapped: state.autoSwapped
  };
};

export const handlePoint = (state: MatchState, winningTeam: 0 | 1, settings: MatchSettings): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));

  if (winningTeam === state.servingTeam) {
    nextState.scores[winningTeam] += 1;
    const [pRight, pLeft] = nextState.teamPositions[winningTeam];
    nextState.teamPositions[winningTeam] = [pLeft, pRight];
    
    // Auto swap sides logic
    if (!nextState.autoSwapped && nextState.scores[winningTeam] === settings.sideChangePoint) {
      nextState.visualSideSwapped = !nextState.visualSideSwapped;
      nextState.autoSwapped = true;
    }

    // Game over logic
    if (nextState.scores[winningTeam] >= settings.winningPoint && (nextState.scores[winningTeam] - nextState.scores[1 - winningTeam] >= 2)) {
      nextState.isGameOver = true;
    }
  } else {
    // We reuse handleSideOut logic but need to manage history carefully
    // To avoid double history recording, we just do the logic here
    if (nextState.serverNumber === 1) {
      nextState.serverNumber = 2;
    } else {
      nextState.servingTeam = (1 - nextState.servingTeam) as 0 | 1;
      nextState.serverNumber = 1;
    }
  }
  return nextState;
};

export const handleSideOut = (state: MatchState): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));

  if (state.serverNumber === 1) {
    nextState.serverNumber = 2;
  } else {
    nextState.servingTeam = (1 - state.servingTeam) as 0 | 1;
    nextState.serverNumber = 1;
  }
  return nextState;
};

export const handleManualSwapPlayers = (state: MatchState, teamIdx: 0 | 1): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));
  const [pRight, pLeft] = nextState.teamPositions[teamIdx];
  nextState.teamPositions[teamIdx] = [pLeft, pRight];
  return nextState;
};

export const handleManualSwapSides = (state: MatchState): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));
  nextState.visualSideSwapped = !nextState.visualSideSwapped;
  return nextState;
};

export const undoState = (state: MatchState): MatchState => {
  if (state.history.length === 0) return state;
  const history = [...state.history];
  const lastSnapshot = history.pop()!;
  return {
    ...state,
    ...lastSnapshot,
    history,
    isGameOver: false
  };
};
