import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { recordRoutes } from '@/navigation/routes';
import { RecordType } from '@/types/models';

const recordTypes: Array<{ label: string; type: RecordType }> = [
  { label: '体重', type: 'weight' },
  { label: '通院', type: 'hospital_visit' },
  { label: 'フード', type: 'food' },
  { label: '保険', type: 'insurance' },
  { label: 'メモ', type: 'memo' },
  { label: '投薬', type: 'medication' },
  { label: '体調', type: 'health_condition' },
];

export function RecordTypeSelectScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>何を記録しますか？</Text>
        {recordTypes.map((recordType) => (
          <Card key={recordType.type}>
            <Text style={styles.recordLabel}>{recordType.label}</Text>
            <AppButton
              label="猫を選ぶ"
              onPress={() => navigation.dispatch(CommonActions.navigate(recordRoutes.catSelect))}
            />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  recordLabel: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});
