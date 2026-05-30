import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/constants/theme';

type PlaceholderAction = {
  label: string;
  routeName: string;
};

type PlaceholderScreenProps = {
  title: string;
  description: string;
  actions?: PlaceholderAction[];
};

export function PlaceholderScreen({ title, description, actions = [] }: PlaceholderScreenProps) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Text style={styles.label}>Phase 1</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </Card>

        {actions.length > 0 ? (
          <View style={styles.actions}>
            {actions.map((action) => (
              <AppButton
                key={action.routeName}
                label={action.label}
                onPress={() => navigation.dispatch(CommonActions.navigate(action.routeName))}
              />
            ))}
          </View>
        ) : null}
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
  label: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.sm,
  },
});
