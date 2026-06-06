import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export function persistCatPhoto(uri: string, fileName?: string | null) {
  if (Platform.OS === 'web') return uri;

  const directory = new Directory(Paths.document, 'cat-photos');
  directory.create({ idempotent: true, intermediates: true });

  const extension = fileName?.split('.').pop()?.toLowerCase() || uri.split('.').pop() || 'jpg';
  const destination = new File(directory, `cat-${Date.now()}.${extension}`);
  new File(uri).copy(destination);
  return destination.uri;
}
