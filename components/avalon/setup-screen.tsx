import { Text, TextInput, View } from 'react-native';

import { styles } from '@/components/avalon/styles';
import {
  Card,
  HeroBlock,
  MetaPill,
  PrimaryButton,
  SectionTitle,
  SegmentButton,
} from '@/components/avalon/ui';
import { getRole, type PlayerCount } from '@/constants/avalon';
import type { AvalonGameController } from '@/hooks/use-avalon-game';

const PLAYER_COUNT_OPTIONS: PlayerCount[] = [5, 6, 7, 8, 9];

export function SetupScreen({ controller }: { controller: AvalonGameController }) {
  const { config, setupCount, setupNames, handleCountChange, updatePlayerName, startGame } = controller;

  return (
    <View style={styles.content}>
      <HeroBlock
        eyebrow=""
        title="Avalon"
        body=""
      />

      <Card>
        <SectionTitle
          title="Số người chơi"
          body=""
        />
        <View style={styles.segmentRow}>
          {PLAYER_COUNT_OPTIONS.map((count) => {
            const selected = count === setupCount;
            return (
              <SegmentButton
                key={count}
                label={`${count}`}
                selected={selected}
                onPress={() => handleCountChange(count)}
              />
            );
          })}
        </View>
        <View style={styles.modeMeta}>
          <MetaPill label={`Số lượng người chơi ở mỗi quest: ${config.questSizes.join(' / ')}`} tone="slate" />
        </View>
      </Card>

      <Card>
        <SectionTitle
          title="Players"
          body="Nhập tên người chơi theo thứ tự."
        />
        <View style={styles.stack}>
          {setupNames.map((name, index) => (
            <View key={index} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{index + 1}</Text>
              <TextInput
                value={name}
                onChangeText={(value) => updatePlayerName(index, value)}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor="#9d9383"
                style={styles.input}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle
          title="Các vai trò trong ván này"
          body=""
        />
        <View style={styles.roleList}>
          {config.roles.map((roleId, index) => {
            const role = getRole(roleId);
            return (
              <View key={`${roleId}-${index}`} style={styles.roleRow}>
                <Text style={styles.roleName}>{role.name}</Text>
                <Text
                  style={[
                    styles.roleAlignment,
                    role.alignment === 'good' ? styles.goodText : styles.evilText,
                  ]}>
                  {role.alignment.toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <PrimaryButton label="Bắt đầu" onPress={startGame} />
    </View>
  );
}
