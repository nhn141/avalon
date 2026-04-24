import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { GameScreen } from '@/components/avalon/game-screen';
import { IntroScreen } from '@/components/avalon/intro-screen';
import { SetupScreen } from '@/components/avalon/setup-screen';
import { styles } from '@/components/avalon/styles';
import { useAvalonGame } from '@/hooks/use-avalon-game';

export default function AvalonScreen() {
  const controller = useAvalonGame();
  const [introComplete, setIntroComplete] = useState(false);

  if (!introComplete) {
    return (
      <SafeAreaView style={styles.introSafeArea}>
        <StatusBar style="light" />
        <IntroScreen onStart={() => setIntroComplete(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.backgroundShapeTop} />
      <View style={styles.backgroundShapeBottom} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {controller.game ? <GameScreen controller={controller} /> : <SetupScreen controller={controller} />}
      </ScrollView>
    </SafeAreaView>
  );
}
