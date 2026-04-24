import { Text, View } from 'react-native';

import { styles } from '@/components/avalon/styles';
import {
  Card,
  MetaPill,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SelectableRow,
} from '@/components/avalon/ui';
import { getAlignment, getFailThreshold, getPlayerBrief, getRole } from '@/constants/avalon';
import type { AvalonGameController } from '@/hooks/use-avalon-game';

export function GamePhasePanel({ controller }: { controller: AvalonGameController }) {
  const { game } = controller;

  if (!game) {
    return null;
  }

  switch (game.phase) {
    case 'roleRevealPrompt':
      return <RoleRevealPrompt controller={controller} />;
    case 'roleRevealCard':
      return <RoleRevealCard controller={controller} />;
    case 'teamProposal':
      return <TeamProposalCard controller={controller} />;
    case 'teamVote':
      return <TeamVoteCard controller={controller} />;
    case 'voteResult':
      return <VoteResultCard controller={controller} />;
    case 'missionPrompt':
      return <MissionPromptCard controller={controller} />;
    case 'missionAction':
      return <MissionActionCard controller={controller} />;
    case 'missionResultPrompt':
      return <MissionResultPromptCard controller={controller} />;
    case 'missionResult':
      return <MissionResultCard controller={controller} />;
    case 'assassinationPrompt':
      return <AssassinationPromptCard controller={controller} />;
    case 'assassinationPick':
      return <AssassinationPickCard controller={controller} />;
    case 'gameOver':
      return <GameOverCard controller={controller} />;
    default:
      return null;
  }
}

function RoleRevealPrompt({ controller }: { controller: AvalonGameController }) {
  const { game, revealCurrentRole } = controller;

  if (!game) {
    return null;
  }

  const currentRevealPlayer = game.players[game.revealIndex];

  if (!currentRevealPlayer) {
    return null;
  }

  return (
    <Card>
      <SectionTitle title="Xem vai trò" body={`Đưa máy cho ${currentRevealPlayer.name}.`} />
      <PrimaryButton label={`Xem vai trò của ${currentRevealPlayer.name}`} onPress={revealCurrentRole} />
    </Card>
  );
}

function RoleRevealCard({ controller }: { controller: AvalonGameController }) {
  const { game, continueRoleReveal } = controller;

  if (!game) {
    return null;
  }

  const currentRevealPlayer = game.players[game.revealIndex];
  const brief = currentRevealPlayer ? getPlayerBrief(currentRevealPlayer, game.players) : null;

  if (!currentRevealPlayer || !brief) {
    return null;
  }

  return (
    <Card highlight>
      <SectionTitle title={currentRevealPlayer.name} body="Vai trò của bạn là:" />
      <View
        style={[
          styles.secretRoleBanner,
          brief.alignment === 'good' ? styles.secretRoleBannerGood : styles.secretRoleBannerEvil,
        ]}>
        <Text style={styles.secretRoleLabel}></Text>
        <Text style={styles.secretRole}>{brief.roleName}</Text>
      </View>
      <Text style={[styles.secretTeam, brief.alignment === 'good' ? styles.goodText : styles.evilText]}>
        {brief.alignment.toUpperCase()}
      </Text>
      <Text style={styles.secretSummary}>{brief.summary}</Text>
      <View style={styles.stack}>
        {brief.intel.map((line) => (
          <Text key={line} style={styles.secretIntel}>
            {line}
          </Text>
        ))}
        {brief.intel.length === 0 && <Text style={styles.secretIntel}>Chỉ vậy thôi</Text>}
      </View>
      <PrimaryButton
        label={game.revealIndex === game.players.length - 1 ? 'Hoàn tất' : 'Đã xem'}
        onPress={continueRoleReveal}
      />
    </Card>
  );
}

function TeamProposalCard({ controller }: { controller: AvalonGameController }) {
  const { game, currentLeader, currentQuestSize, toggleTeamMember, submitTeamProposal } = controller;

  if (!game) {
    return null;
  }

  return (
    <Card>
      <SectionTitle
        title="Chọn team"
        body={`${currentLeader?.name} là đội trưởng. Chọn ra ${currentQuestSize} người cho Quest ${game.questIndex + 1}.`}
      />
      <View style={styles.stack}>
        {game.players.map((player, index) => {
          const selected = game.proposedTeam.includes(index);
          return (
            <SelectableRow
              key={player.id}
              title={player.name}
              subtitle={selected ? 'Đang trong team' : 'Bấm vào để chọn'}
              selected={selected}
              onPress={() => toggleTeamMember(index)}
            />
          );
        })}
      </View>
      <View style={styles.modeMeta}>
        <MetaPill label={`Selected ${game.proposedTeam.length}/${currentQuestSize}`} tone="accent" />
        <MetaPill label={`Proposal ${game.rejectCount + 1}/5`} tone="gold" />
      </View>
      <PrimaryButton
        label="Xác nhận"
        disabled={game.proposedTeam.length !== currentQuestSize}
        onPress={submitTeamProposal}
      />
    </Card>
  );
}

function TeamVoteCard({ controller }: { controller: AvalonGameController }) {
  const { game, castVote } = controller;

  if (!game) {
    return null;
  }

  return (
    <Card>
      <SectionTitle
        title="Team Vote"
        body={`Đưa máy cho ${game.players[game.currentVoterIndex].name} để vote.`}
      />
      <View style={styles.modeMeta}>
        <MetaPill
          label={`Team: ${game.proposedTeam.map((index) => game.players[index].name).join(', ')}`}
          tone="slate"
        />
      </View>
      <View style={styles.buttonRow}>
        <SecondaryButton label="Từ chối" tone="evil" onPress={() => castVote('reject')} />
        <PrimaryButton label="Chấp nhận" onPress={() => castVote('approve')} />
      </View>
    </Card>
  );
}

function VoteResultCard({ controller }: { controller: AvalonGameController }) {
  const { game, resolveVoteResult } = controller;

  if (!game) {
    return null;
  }

  const approveCount = game.votes.filter((vote) => vote === 'approve').length;
  const isTeamApproved = approveCount > game.players.length / 2;

  return (
    <Card>
      <SectionTitle
        title="Kết quả vote"
        body={
          isTeamApproved
            ? 'Đa số phiếu chấp nhận. Đội được thông qua.'
            : 'Đa số phiếu từ chối. Đội bị từ chối. Người kế tiếp sẽ trở thành đội trưởng.'
        }
      />
      <View style={styles.stack}>
        {game.players.map((player, index) => {
          const vote = game.votes[index];
          const approve = vote === 'approve';
          return (
            <View key={player.id} style={styles.voteRow}>
              <Text style={styles.voteName}>{player.name}</Text>
              <Text style={[styles.voteValue, approve ? styles.goodText : styles.evilText]}>
                {approve ? 'Chấp nhận' : 'Từ chối'}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.modeMeta}>
        <MetaPill label={`Chấp nhận ${approveCount}`} tone="good" />
        <MetaPill label={`Từ chối ${game.players.length - approveCount}`} tone="evil" />
      </View>
      <PrimaryButton
        label={isTeamApproved ? 'Bắt đầu nhiệm vụ' : 'Chuyển sang đội trưởng mới'}
        onPress={resolveVoteResult}
      />
    </Card>
  );
}

function MissionPromptCard({ controller }: { controller: AvalonGameController }) {
  const { game, confirmMissionPlayerReady } = controller;

  if (!game) {
    return null;
  }

  const currentMissionPlayer = game.players[game.proposedTeam[game.currentMissionActorIndex]];

  if (!currentMissionPlayer) {
    return null;
  }

  return (
    <Card>
      <SectionTitle
        title={`Đưa máy cho ${currentMissionPlayer.name} để thực hiện nhiệm vụ`}
        body=""
      />
      <View style={styles.modeMeta}>
        <MetaPill
          label={`Team: ${game.proposedTeam.map((index) => game.players[index].name).join(', ')}`}
          tone="slate"
        />
        <MetaPill
          label={`Lượt ${game.currentMissionActorIndex + 1}/${game.proposedTeam.length}`}
          tone="accent"
        />
      </View>
      <PrimaryButton label={`${currentMissionPlayer.name} bắt đầu nhiệm vụ`} onPress={confirmMissionPlayerReady} />
    </Card>
  );
}

function MissionActionCard({ controller }: { controller: AvalonGameController }) {
  const { game, submitMissionCard } = controller;

  if (!game) {
    return null;
  }

  const currentMissionPlayer = game.players[game.proposedTeam[game.currentMissionActorIndex]];
  const currentMissionRole = currentMissionPlayer ? getRole(currentMissionPlayer.roleId) : null;
  const currentMissionIsEvil =
    currentMissionPlayer ? getAlignment(currentMissionPlayer.roleId) === 'evil' : false;

  if (!currentMissionPlayer || !currentMissionRole) {
    return null;
  }

  return (
    <Card highlight>
      <SectionTitle
        title="Thẻ nhiệm vụ"
        body=""
      />
      <Text style={styles.secretSummary}>
        Vai trò của bạn: {currentMissionRole.name}
      </Text>
      <View style={styles.buttonColumn}>
        <PrimaryButton label="Thành công" onPress={() => submitMissionCard('success')} />
        {currentMissionIsEvil && (
          <SecondaryButton label="Thất bại" tone="evil" onPress={() => submitMissionCard('fail')} />
        )}
      </View>
    </Card>
  );
}

function MissionResultPromptCard({ controller }: { controller: AvalonGameController }) {
  const { game, revealMissionResult } = controller;

  if (!game) {
    return null;
  }

  return (
    <Card>
      <SectionTitle
        title="Tất cả đã xong nhiệm vụ"
        body="Đưa máy ra giữa bàn để xem kết quả."
      />
      <View style={styles.modeMeta}>
        <MetaPill label={`Quest ${game.questIndex + 1}`} tone="accent" />
        <MetaPill label={`Team size: ${game.proposedTeam.length}`} tone="slate" />
      </View>
      <PrimaryButton label="Xem kết quả" onPress={revealMissionResult} />
    </Card>
  );
}

function MissionResultCard({ controller }: { controller: AvalonGameController }) {
  const { game, resolveMissionResult } = controller;

  if (!game) {
    return null;
  }

  const failCount = game.missionCards.filter((card) => card === 'fail').length;
  const failThreshold = getFailThreshold(game.config, game.questIndex);

  return (
    <Card>
      <SectionTitle
        title="Kết quả"
        body=""
      />
      <View style={styles.resultCenter}>
        <Text style={styles.resultHeadline}>
          {failCount >= failThreshold ? 'Nhiệm vụ thất bại' : 'Nhiệm vụ thành công'}
        </Text>
        <Text style={styles.resultMeta}>{`Số lá thất bại: ${failCount}`}</Text>
      </View>
      <PrimaryButton label="Tiếp theo" onPress={resolveMissionResult} />
    </Card>
  );
}

function AssassinationPromptCard({ controller }: { controller: AvalonGameController }) {
  const { confirmAssassinReady } = controller;

  return (
    <Card>
      <SectionTitle
        title="Ám sát"
        body="Đã thành công 3 nhiệm vụ. Bây giờ Sát thủ sẽ tìm Merlin để ám sát."
      />
      <PrimaryButton label="Bắt đầu ám sát" onPress={confirmAssassinReady} />
    </Card>
  );
}

function AssassinationPickCard({ controller }: { controller: AvalonGameController }) {
  const { game, assassin, pickAssassinationTarget } = controller;

  if (!game) {
    return null;
  }

  return (
    <Card highlight>
      <SectionTitle
        title="Tìm Merlin"
        body={`${assassin ? `${assassin.name}` : ''} chọn một mục tiêu để ám sát. Nếu chọn đúng Merlin, phe Ác sẽ thắng.`}
      />
      <View style={styles.stack}>
        {game.players
          .filter((player) => getAlignment(player.roleId) === 'good')
          .map((player) => (
            <SelectableRow
              key={player.id}
              title={player.name}
              subtitle=""
              selected={false}
              onPress={() => pickAssassinationTarget(player.id)}
            />
          ))}
      </View>
    </Card>
  );
}

function GameOverCard({ controller }: { controller: AvalonGameController }) {
  const { game, restartSameRoster, resetToSetup } = controller;

  if (!game) {
    return null;
  }

  return (
    <Card>
      <SectionTitle title={game.winner === 'good' ? 'Phe Thiện thắng' : 'Phe Ác thắng'} body={game.endReason} />
      <View style={styles.stack}>
        {game.players.map((player) => {
          const role = getRole(player.roleId);
          return (
            <View key={player.id} style={styles.revealRow}>
              <Text style={styles.revealName}>{player.name}</Text>
              <Text style={styles.revealRole}>{role.name}</Text>
              <Text
                style={[
                  styles.revealTeam,
                  role.alignment === 'good' ? styles.goodText : styles.evilText,
                ]}>
                {role.alignment.toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.buttonColumn}>
        <PrimaryButton label="Chơi lại với danh sách hiện tại" onPress={restartSameRoster} />
        <SecondaryButton label="Set up lại trò chơi" tone="slate" onPress={resetToSetup} />
      </View>
    </Card>
  );
}
