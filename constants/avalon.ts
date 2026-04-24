export type PlayerCount = 5 | 6 | 7 | 8 | 9;
export type Alignment = 'good' | 'evil';
export type RoleId =
  | 'merlin'
  | 'percival'
  | 'loyal-servant'
  | 'assassin'
  | 'morgana'
  | 'mordred';
export type TeamVote = 'approve' | 'reject';
export type MissionCard = 'success' | 'fail';
export type QuestOutcome = 'success' | 'fail';

export type RoleDefinition = {
  id: RoleId;
  name: string;
  alignment: Alignment;
  summary: string;
};

export type GameConfig = {
  playerCount: PlayerCount;
  modeLabel: string;
  roles: RoleId[];
  questSizes: number[];
  doubleFailQuestIndex: number | null;
};

export type GamePlayer = {
  id: string;
  name: string;
  roleId: RoleId;
};

export const ROLE_DEFINITIONS: Record<RoleId, RoleDefinition> = {
  merlin: {
    id: 'merlin',
    name: 'Merlin',
    alignment: 'good',
    summary: 'Thuộc phe tốt, biết được tất cả phe ác trừ Mordred',
  },
  percival: {
    id: 'percival',
    name: 'Percival',
    alignment: 'good',
    summary: 'Thuộc phe tốt, thấy Merlin (tốt) và Morgana (ác), nhưng không phân biệt được',
  },
  'loyal-servant': {
    id: 'loyal-servant',
    name: 'Dân đen',
    alignment: 'good',
    summary: 'Thuộc phe tốt',
  },
  assassin: {
    id: 'assassin',
    name: 'Sát thủ',
    alignment: 'evil',
    summary: 'Thuộc phe ác, khi thua có thể lật kèo bằng cách giết Merlin',
  },
  morgana: {
    id: 'morgana',
    name: 'Morgana',
    alignment: 'evil',
    summary: 'Thuộc phe ác, đóng giả Merlin để lừa Percival',
  },
  mordred: {
    id: 'mordred',
    name: 'Mordred',
    alignment: 'evil',
    summary: 'Thuộc phe ác, nhưng Merlin không biết',
  },
};

export const GAME_CONFIGS: Record<PlayerCount, GameConfig> = {
  5: {
    playerCount: 5,
    modeLabel: '5 Players',
    roles: ['merlin', 'percival', 'loyal-servant', 'assassin', 'morgana'],
    questSizes: [2, 3, 2, 3, 3],
    doubleFailQuestIndex: null,
  },
  6: {
    playerCount: 6,
    modeLabel: '6 Players',
    roles: ['merlin', 'percival', 'loyal-servant', 'loyal-servant', 'assassin', 'morgana'],
    questSizes: [2, 3, 4, 3, 4],
    doubleFailQuestIndex: null,
  },
  7: {
    playerCount: 7,
    modeLabel: '7 Players',
    roles: ['merlin', 'percival', 'loyal-servant', 'loyal-servant', 'assassin', 'morgana', 'mordred'],
    questSizes: [2, 3, 3, 4, 4],
    doubleFailQuestIndex: 3,
  },
  8: {
    playerCount: 8,
    modeLabel: '8 Players',
    roles: [
      'merlin',
      'percival',
      'loyal-servant',
      'loyal-servant',
      'loyal-servant',
      'assassin',
      'morgana',
      'mordred',
    ],
    questSizes: [3, 4, 4, 5, 5],
    doubleFailQuestIndex: 3,
  },
  9: {
    playerCount: 9,
    modeLabel: '9 Players',
    roles: [
      'merlin',
      'percival',
      'loyal-servant',
      'loyal-servant',
      'loyal-servant',
      'loyal-servant',
      'assassin',
      'morgana',
      'mordred',
    ],
    questSizes: [3, 4, 4, 5, 5],
    doubleFailQuestIndex: 3,
  },
};

export function buildDefaultPlayerNames(count: PlayerCount) {
  return Array.from({ length: count }, (_, index) => `Player ${index + 1}`);
}

export function createPlayers(playerNames: string[], roles: RoleId[]) {
  const shuffledRoles = shuffleList(roles);

  return playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    roleId: shuffledRoles[index],
  }));
}

export function getRole(roleId: RoleId) {
  return ROLE_DEFINITIONS[roleId];
}

export function getAlignment(roleId: RoleId) {
  return ROLE_DEFINITIONS[roleId].alignment;
}

export function getPlayerBrief(player: GamePlayer, players: GamePlayer[]) {
  const role = getRole(player.roleId);
  const intel: string[] = [];

  if (player.roleId === 'merlin') {
    const visibleEvil = players.filter(
      (candidate) => getAlignment(candidate.roleId) === 'evil' && candidate.roleId !== 'mordred'
    );

    intel.push(
      visibleEvil.length
        ? `${visibleEvil.map((candidate) => candidate.name).join(', ')} thuộc phe ác`
        : 'Bạn không thấy bất cứ ai.'
    );
  }

  if (player.roleId === 'percival') {
    const merlinAndMorgana = shuffleList(
      players.filter((candidate) => candidate.roleId === 'merlin' || candidate.roleId === 'morgana')
    );

    intel.push(
      `Bạn thấy: ${merlinAndMorgana.map((candidate) => candidate.name).join(', ')}`
    );
  }

  if (getAlignment(player.roleId) === 'evil') {
    const allies = players.filter(
      (candidate) =>
        candidate.id !== player.id &&
        getAlignment(candidate.roleId) === 'evil'
    );

    intel.push(allies.length ? `Đồng đội chung phe ác: ${allies.map((ally) => ally.name).join(', ')}` : 'Bạn là Evil duy nhất.');
  }

  if (player.roleId === 'mordred') {
    intel.push('Merlin không biết bạn là phe ác');
  }

  return {
    roleName: role.name,
    alignment: role.alignment,
    summary: role.summary,
    intel,
  };
}

export function getFailThreshold(config: GameConfig, questIndex: number) {
  return config.doubleFailQuestIndex === questIndex ? 2 : 1;
}

export function missionFails(config: GameConfig, questIndex: number, failCount: number) {
  return failCount >= getFailThreshold(config, questIndex);
}

function shuffleList<T>(items: readonly T[]) {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = cloned[index];
    cloned[index] = cloned[randomIndex];
    cloned[randomIndex] = current;
  }

  return cloned;
}
