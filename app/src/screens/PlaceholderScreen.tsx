import { Text } from 'react-native';
import { Card, Screen, Title } from '../components/ui';

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Screen>
      <Title subtitle="この画面は次の実装フェーズで仕上げます。">{title}</Title>
      <Card>
        <Text>ねこレコ MVP</Text>
      </Card>
    </Screen>
  );
}
