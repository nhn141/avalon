import { useState } from 'react';
import { ImageBackground, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { styles } from '@/components/avalon/styles';
import { getAlignmentLabel, getRole, type RoleId } from '@/constants/avalon';

const introBackground = require('../../assets/images/icon.png');

const SECRET_ROLE_IDS: RoleId[] = ['merlin', 'percival', 'loyal-servant', 'assassin', 'morgana', 'mordred'];

const RULE_ITEMS = [
  {
    title: 'Mục tiêu',
    body: 'Phe Thiện thắng khi hoàn thành 3 nhiệm vụ. Phe Ác thắng khi làm thất bại 3 nhiệm vụ hoặc ám sát đúng Merlin.',
  },
  {
    title: 'Mỗi vòng chơi',
    body: 'Một đội trưởng được chỉ định ngẫu nhiên. Đội trưởng sẽ chọn đội thực hiện nhiệm vụ. Tất cả người chơi bỏ phiếu Chấp nhận hoặc Từ chối đội hình đó. Nếu đa số phiếu là Chấp nhận thì đội sẽ được thông qua, ngược lại, quyền đội trưởng sẽ được dời sang người kế tiếp. Nếu đội bị Từ chối 5 lần liên tiếp thì phe Ác thắng.',
  },
  {
    title: 'Nhiệm vụ',
    body: 'Nếu đội được thông qua, các thành viên trong đội thực hiện nhiệm vụ bằng cách bí mật chọn 1 trong 2 lá: Thành công hoặc Thất bại (Lưu ý: phe Thiện chỉ được chọn Thành công, phe Ác được lựa chọn 1 trong 2 lá). Nhiệm vụ hoàn thành khi không có lá Thất bại nào được chọn. Trong các ván có từ 7 người chơi trở lên, tại nhiệm vụ thứ 4 yêu cầu ít nhất phải có hai thẻ Thất bại mới được coi là nhiệm vụ thất bại.',
  },
  {
    title: 'Các nhân vật trong trò chơi',
    body: 'Các nhân vật sẽ được chia thành 2 phe: Phe Thiện và Phe Ác. Dưới đây là các vai trò ở từng phe.',
    roles: SECRET_ROLE_IDS,
  },
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const [rulesVisible, setRulesVisible] = useState(false);

  return (
    <>
      <ImageBackground
        source={introBackground}
        resizeMode="cover"
        blurRadius={5}
        style={styles.introBackground}
        imageStyle={styles.introBackgroundImage}>
        <View style={styles.introTint} />
        <View style={styles.introContent}>
          <View style={styles.introTop}>
            <View style={styles.introCopy}>
              <Text style={styles.introEyebrow}>The Resistance</Text>
              <Text style={styles.introTitle}>Avalon</Text>
            </View>
          </View>

          <View style={styles.introButtonGroup}>
            <Pressable
              accessibilityRole="button"
              onPress={onStart}
              style={({ pressed }) => [
                styles.introButton,
                styles.introPrimaryButton,
                pressed ? styles.introButtonPressed : null,
              ]}>
              <Text style={styles.introPrimaryButtonText}>Bắt Đầu</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRulesVisible(true)}
              style={({ pressed }) => [
                styles.introButton,
                styles.introSecondaryButton,
                pressed ? styles.introButtonPressed : null,
              ]}>
              <Text style={styles.introSecondaryButtonText}>Luật Chơi</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <Modal
        animationType="fade"
        transparent
        visible={rulesVisible}
        onRequestClose={() => setRulesVisible(false)}>
        <SafeAreaView style={styles.rulesModalBackdrop}>
          <View style={styles.rulesPanel}>
            <View style={styles.rulesHeader}>
              <View>
                <Text style={styles.rulesEyebrow}>Avalon</Text>
                <Text style={styles.rulesTitle}>Luật Chơi</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRulesVisible(false)}
                style={({ pressed }) => [styles.rulesCloseButton, pressed ? styles.introButtonPressed : null]}>
                <Text style={styles.rulesCloseText}>Đóng</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.rulesList}>
              {RULE_ITEMS.map((item) => (
                <View key={item.title} style={styles.rulesItem}>
                  <Text style={styles.rulesItemTitle}>{item.title}</Text>
                  <Text style={styles.rulesItemBody}>{item.body}</Text>
                  {item.roles ? (
                    <View style={styles.rulesRoleList}>
                      {item.roles.map((roleId) => {
                        const role = getRole(roleId);

                        return (
                          <View key={role.id} style={styles.rulesRoleItem}>
                            <View style={styles.rulesRoleHeader}>
                              <Text style={styles.rulesRoleName}>{role.name}</Text>
                              <Text
                                style={[
                                  styles.rulesRoleTeam,
                                  role.alignment === 'good' ? styles.rulesRoleTeamGood : styles.rulesRoleTeamEvil,
                                ]}>
                                {getAlignmentLabel(role.alignment)}
                              </Text>
                            </View>
                            <Text style={styles.rulesRoleBody}>{role.summary}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
