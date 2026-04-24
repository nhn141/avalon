import { useState } from 'react';

import {
  buildDefaultPlayerNames,
  createPlayers,
  GAME_CONFIGS,
  getFailThreshold,
  type GameConfig,
  type GamePlayer,
  type MissionCard,
  type PlayerCount,
  type QuestOutcome,
  type TeamVote,
} from '@/constants/avalon';

export type ScreenPhase =
  | 'setup'
  | 'roleRevealPrompt'
  | 'roleRevealCard'
  | 'teamProposal'
  | 'teamVote'
  | 'voteResult'
  | 'missionPrompt'
  | 'missionAction'
  | 'missionResultPrompt'
  | 'missionResult'
  | 'assassinationPrompt'
  | 'assassinationPick'
  | 'gameOver';

export type QuestRecord = {
  questNumber: number;
  team: string[];
  teamSize: number;
  failCount: number;
  outcome: QuestOutcome;
};

export type GameState = {
  phase: ScreenPhase;
  config: GameConfig;
  players: GamePlayer[];
  leaderIndex: number;
  questIndex: number;
  rejectCount: number;
  revealIndex: number;
  proposedTeam: number[];
  currentVoterIndex: number;
  votes: TeamVote[];
  currentMissionActorIndex: number;
  missionCards: MissionCard[];
  questHistory: QuestRecord[];
  winner: 'good' | 'evil' | null;
  endReason: string;
};

export type AvalonGameController = {
  setupCount: PlayerCount;
  setupNames: string[];
  config: GameConfig;
  game: GameState | null;
  currentLeader: GamePlayer | null;
  currentQuestSize: number;
  assassin: GamePlayer | null;
  handleCountChange: (nextCount: PlayerCount) => void;
  updatePlayerName: (index: number, value: string) => void;
  startGame: () => void;
  revealCurrentRole: () => void;
  continueRoleReveal: () => void;
  toggleTeamMember: (playerIndex: number) => void;
  submitTeamProposal: () => void;
  castVote: (vote: TeamVote) => void;
  resolveVoteResult: () => void;
  confirmMissionPlayerReady: () => void;
  submitMissionCard: (card: MissionCard) => void;
  revealMissionResult: () => void;
  resolveMissionResult: () => void;
  confirmAssassinReady: () => void;
  pickAssassinationTarget: (targetId: string) => void;
  restartSameRoster: () => void;
  resetToSetup: () => void;
};

export function useAvalonGame(): AvalonGameController {
  const [setupCount, setSetupCount] = useState<PlayerCount>(5);
  const [setupNames, setSetupNames] = useState<string[]>(buildDefaultPlayerNames(5));
  const [game, setGame] = useState<GameState | null>(null);

  const config = game?.config ?? GAME_CONFIGS[setupCount];
  const currentLeader = game ? game.players[game.leaderIndex] : null;
  const currentQuestSize = game ? game.config.questSizes[game.questIndex] : config.questSizes[0];
  const assassin = game?.players.find((player) => player.roleId === 'assassin') ?? null;

  function handleCountChange(nextCount: PlayerCount) {
    setSetupCount(nextCount);
    setSetupNames((current) => {
      const defaults = buildDefaultPlayerNames(nextCount);
      return Array.from({ length: nextCount }, (_, index) => current[index] ?? defaults[index]);
    });
  }

  function updatePlayerName(index: number, value: string) {
    setSetupNames((current) => current.map((name, nameIndex) => (nameIndex === index ? value : name)));
  }

  function startGame() {
    const normalizedNames = setupNames.map((name, index) => {
      const trimmed = name.trim();
      return trimmed || `Player ${index + 1}`;
    });

    setGame(createNewGame(GAME_CONFIGS[setupCount], normalizedNames));
  }

  function revealCurrentRole() {
    setGame((current) => {
      if (!current || current.phase !== 'roleRevealPrompt') {
        return current;
      }

      return {
        ...current,
        phase: 'roleRevealCard',
      };
    });
  }

  function continueRoleReveal() {
    setGame((current) => {
      if (!current || current.phase !== 'roleRevealCard') {
        return current;
      }

      const isLastReveal = current.revealIndex === current.players.length - 1;

      return {
        ...current,
        phase: isLastReveal ? 'teamProposal' : 'roleRevealPrompt',
        revealIndex: isLastReveal ? current.revealIndex : current.revealIndex + 1,
      };
    });
  }

  function toggleTeamMember(playerIndex: number) {
    setGame((current) => {
      if (!current || current.phase !== 'teamProposal') {
        return current;
      }

      const isSelected = current.proposedTeam.includes(playerIndex);

      if (isSelected) {
        return {
          ...current,
          proposedTeam: current.proposedTeam.filter((index) => index !== playerIndex),
        };
      }

      if (current.proposedTeam.length >= current.config.questSizes[current.questIndex]) {
        return current;
      }

      return {
        ...current,
        proposedTeam: [...current.proposedTeam, playerIndex],
      };
    });
  }

  function submitTeamProposal() {
    setGame((current) => {
      if (!current || current.phase !== 'teamProposal') {
        return current;
      }

      if (current.proposedTeam.length !== current.config.questSizes[current.questIndex]) {
        return current;
      }

      return {
        ...current,
        phase: 'teamVote',
        votes: [],
        currentVoterIndex: 0,
      };
    });
  }

  function castVote(vote: TeamVote) {
    setGame((current) => {
      if (!current || current.phase !== 'teamVote') {
        return current;
      }

      const nextVotes = [...current.votes, vote];
      const nextVoterIndex = current.currentVoterIndex + 1;

      return {
        ...current,
        votes: nextVotes,
        currentVoterIndex: nextVoterIndex,
        phase: nextVotes.length === current.players.length ? 'voteResult' : 'teamVote',
      };
    });
  }

  function resolveVoteResult() {
    setGame((current) => {
      if (!current || current.phase !== 'voteResult') {
        return current;
      }

      const approveCount = current.votes.filter((vote) => vote === 'approve').length;
      const isApproved = approveCount > current.players.length / 2;

      if (isApproved) {
        return {
          ...current,
          phase: 'missionPrompt',
          currentMissionActorIndex: 0,
          missionCards: [],
        };
      }

      const nextRejectCount = current.rejectCount + 1;

      if (nextRejectCount >= 5) {
        return {
          ...current,
          phase: 'gameOver',
          rejectCount: nextRejectCount,
          winner: 'evil',
          endReason: '5 đội liên tiếp bị từ chối.',
        };
      }

      return {
        ...current,
        phase: 'teamProposal',
        leaderIndex: getNextIndex(current.leaderIndex, current.players.length),
        rejectCount: nextRejectCount,
        proposedTeam: [],
        currentVoterIndex: 0,
        votes: [],
      };
    });
  }

  function confirmMissionPlayerReady() {
    setGame((current) => {
      if (!current || current.phase !== 'missionPrompt') {
        return current;
      }

      return {
        ...current,
        phase: 'missionAction',
      };
    });
  }

  function submitMissionCard(card: MissionCard) {
    setGame((current) => {
      if (!current || current.phase !== 'missionAction') {
        return current;
      }

      const nextCards = [...current.missionCards, card];
      const nextMissionActorIndex = current.currentMissionActorIndex + 1;
      const missionComplete = nextCards.length === current.proposedTeam.length;

      return {
        ...current,
        missionCards: nextCards,
        currentMissionActorIndex: nextMissionActorIndex,
        phase: missionComplete ? 'missionResultPrompt' : 'missionPrompt',
      };
    });
  }

  function revealMissionResult() {
    setGame((current) => {
      if (!current || current.phase !== 'missionResultPrompt') {
        return current;
      }

      return {
        ...current,
        phase: 'missionResult',
      };
    });
  }

  function resolveMissionResult() {
    setGame((current) => {
      if (!current || current.phase !== 'missionResult') {
        return current;
      }

      const failCount = current.missionCards.filter((card) => card === 'fail').length;
      const failThreshold = getFailThreshold(current.config, current.questIndex);
      const questOutcome: QuestOutcome = failCount >= failThreshold ? 'fail' : 'success';
      const questHistory = [
        ...current.questHistory,
        {
          questNumber: current.questIndex + 1,
          team: current.proposedTeam.map((playerIndex) => current.players[playerIndex].name),
          teamSize: current.proposedTeam.length,
          failCount,
          outcome: questOutcome,
        },
      ];
      const goodWins = questHistory.filter((quest) => quest.outcome === 'success').length;
      const evilWins = questHistory.filter((quest) => quest.outcome === 'fail').length;

      if (evilWins >= 3) {
        return {
          ...current,
          phase: 'gameOver',
          questHistory,
          winner: 'evil',
          endReason: 'Phe xấu đã làm thất bại 3 nhiệm vụ.',
        };
      }

      if (goodWins >= 3) {
        return {
          ...current,
          phase: 'assassinationPrompt',
          questHistory,
        };
      }

      return {
        ...current,
        phase: 'teamProposal',
        questHistory,
        questIndex: current.questIndex + 1,
        leaderIndex: getNextIndex(current.leaderIndex, current.players.length),
        rejectCount: 0,
        proposedTeam: [],
        currentVoterIndex: 0,
        votes: [],
        missionCards: [],
        currentMissionActorIndex: 0,
      };
    });
  }

  function confirmAssassinReady() {
    setGame((current) => {
      if (!current || current.phase !== 'assassinationPrompt') {
        return current;
      }

      return {
        ...current,
        phase: 'assassinationPick',
      };
    });
  }

  function pickAssassinationTarget(targetId: string) {
    setGame((current) => {
      if (!current || current.phase !== 'assassinationPick') {
        return current;
      }

      const target = current.players.find((player) => player.id === targetId);
      const merlin = current.players.find((player) => player.roleId === 'merlin');
      const evilWins = target?.roleId === 'merlin';

      return {
        ...current,
        phase: 'gameOver',
        winner: evilWins ? 'evil' : 'good',
        endReason: evilWins
          ? `Sát thủ đã đoán đúng Merlin: ${target?.name}.`
          : `sát thủ đoán sai. Merlin là ${merlin?.name}.`,
      };
    });
  }

  function restartSameRoster() {
    setGame((current) => {
      if (!current) {
        return current;
      }

      const names = current.players.map((player) => player.name);
      return createNewGame(current.config, names);
    });
  }

  function resetToSetup() {
    setGame(null);
  }

  return {
    setupCount,
    setupNames,
    config,
    game,
    currentLeader,
    currentQuestSize,
    assassin,
    handleCountChange,
    updatePlayerName,
    startGame,
    revealCurrentRole,
    continueRoleReveal,
    toggleTeamMember,
    submitTeamProposal,
    castVote,
    resolveVoteResult,
    confirmMissionPlayerReady,
    submitMissionCard,
    revealMissionResult,
    resolveMissionResult,
    confirmAssassinReady,
    pickAssassinationTarget,
    restartSameRoster,
    resetToSetup,
  };
}

function createNewGame(config: GameConfig, playerNames: string[]): GameState {
  const players = createPlayers(playerNames, config.roles);
  const leaderIndex = Math.floor(Math.random() * players.length);

  return {
    phase: 'roleRevealPrompt',
    config,
    players,
    leaderIndex,
    questIndex: 0,
    rejectCount: 0,
    revealIndex: 0,
    proposedTeam: [],
    currentVoterIndex: 0,
    votes: [],
    currentMissionActorIndex: 0,
    missionCards: [],
    questHistory: [],
    winner: null,
    endReason: '',
  };
}

function getNextIndex(index: number, length: number) {
  return (index + 1) % length;
}
