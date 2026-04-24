import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { GameScreen } from '@/components/avalon/game-screen';
import { SetupScreen } from '@/components/avalon/setup-screen';
import { styles } from '@/components/avalon/styles';
import { useAvalonGame } from '@/hooks/use-avalon-game';

export default function AvalonScreen() {
  const controller = useAvalonGame();

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
