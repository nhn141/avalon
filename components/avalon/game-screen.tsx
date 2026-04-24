import { Text, View } from 'react-native';

import { GamePhasePanel } from '@/components/avalon/game-phases';
import { styles } from '@/components/avalon/styles';
import { Card, HeroBlock, SectionTitle, StatBlock } from '@/components/avalon/ui';
import type { AvalonGameController } from '@/hooks/use-avalon-game';

export function GameScreen({ controller }: { controller: AvalonGameController }) {
  const { game, currentLeader, currentQuestSize } = controller;

  if (!game) {
    return null;
  }

  const currentQuestNeedsTwoFails = game.config.doubleFailQuestIndex === game.questIndex;
  const isRoleRevealPhase =
    game.phase === 'roleRevealPrompt' || game.phase === 'roleRevealCard';

  return (
    <View style={styles.content}>
      <HeroBlock
        eyebrow={game.config.modeLabel}
        title={isRoleRevealPhase ? 'Xem vai trò' : `Quest ${game.questIndex + 1}`}
        body=""
      />

      {!isRoleRevealPhase && (
        <Card>
          <SectionTitle title="Bảng nhiệm vụ" body="" />
          <View style={styles.boardGrid}>
            <StatBlock label="Đội trưởng" value={currentLeader?.name ?? '-'} tone="accent" />
            <StatBlock label="Số người làm nhiệm vụ" value={String(currentQuestSize)} tone="slate" />
            <StatBlock label="Từ chối" value={`${game.rejectCount}/5`} tone="gold" />
            <StatBlock
              label="Nhiệm vụ thất bại khi có: "
              value={currentQuestNeedsTwoFails ? '2 lá Thất bại' : '1 lá Thất bại'}
              tone="ink"
            />
          </View>
          <View style={styles.historyRow}>
            {game.config.questSizes.map((teamSize, index) => {
              const quest = game.questHistory[index];
              return (
                <View
                  key={index}
                  style={[
                    styles.historyChip,
                    quest?.outcome === 'success'
                      ? styles.historyChipGood
                      : quest?.outcome === 'fail'
                        ? styles.historyChipEvil
                        : styles.historyChipPending,
                  ]}>
                  <Text style={styles.historyChipText}>{`Q${index + 1} / ${teamSize}`}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      <GamePhasePanel controller={controller} />

      {!isRoleRevealPhase && game.questHistory.length > 0 && (
        <Card>
          <SectionTitle title="Quest Log" body="Lịch sử làm nhiệm vụ." />
          <View style={styles.stack}>
            {game.questHistory.map((quest) => (
              <View key={quest.questNumber} style={styles.logRow}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTitle}>{`Quest ${quest.questNumber}`}</Text>
                  <Text
                    style={[
                      styles.logOutcome,
                      quest.outcome === 'success' ? styles.goodText : styles.evilText,
                    ]}>
                    {quest.outcome === 'success' ? 'THÀNH CÔNG' : 'THẤT BẠI'}
                  </Text>
                </View>
                <Text style={styles.logBody}>{`Team (${quest.teamSize}): ${quest.team.join(', ')}`}</Text>
                <Text style={styles.logBody}>{`Số lá thất bại: ${quest.failCount}`}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </View>
  );
}
