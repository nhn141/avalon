import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/components/avalon/styles';

export function HeroBlock({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroBody}>{body}</Text>
    </View>
  );
}

export function Card({
  children,
  highlight = false,
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return <View style={[styles.card, highlight ? styles.cardHighlight : null]}>{children}</View>;
}

export function SectionTitle({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

export function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, selected ? styles.segmentButtonSelected : null]}>
      <Text style={[styles.segmentButtonText, selected ? styles.segmentButtonTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled ? styles.disabledButton : null]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  tone,
}: {
  label: string;
  onPress: () => void;
  tone: 'evil' | 'slate';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.secondaryButton,
        tone === 'evil' ? styles.secondaryButtonEvil : styles.secondaryButtonSlate,
      ]}>
      <Text style={[styles.secondaryButtonText, tone === 'evil' ? styles.evilText : styles.slateText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SelectableRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.selectableRow, selected ? styles.selectableRowSelected : null]}>
      <View>
        <Text style={styles.selectableTitle}>{title}</Text>
        <Text style={styles.selectableSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export function MetaPill({
  label,
  tone,
}: {
  label: string;
  tone: 'accent' | 'slate' | 'gold' | 'good' | 'evil';
}) {
  return (
    <View
      style={[
        styles.metaPill,
        tone === 'accent'
          ? styles.metaPillAccent
          : tone === 'slate'
            ? styles.metaPillSlate
            : tone === 'gold'
              ? styles.metaPillGold
              : tone === 'good'
                ? styles.metaPillGood
                : styles.metaPillEvil,
      ]}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

export function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'accent' | 'slate' | 'gold' | 'ink';
}) {
  return (
    <View
      style={[
        styles.statBlock,
        tone === 'accent'
          ? styles.statBlockAccent
          : tone === 'slate'
            ? styles.statBlockSlate
            : tone === 'gold'
              ? styles.statBlockGold
              : styles.statBlockInk,
      ]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
