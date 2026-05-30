import { listProjectFiles, readText } from './shared';

const requiredFiles = [
  'App.tsx',
  'app.json',
  'assets/logo.png',
  'babel.config.js',
  'package.json',
  'tsconfig.json',
  'src/constants/theme.ts',
  'src/navigation/routes.ts',
  'src/store/mockData.ts',
  'src/store/useAppStore.ts',
  'src/types/models.ts',
  'src/utils/date.ts',
] as const;

const files = new Set(await listProjectFiles());
const missing = requiredFiles.filter((file) => !files.has(file));

if (missing.length > 0) {
  console.error(`missing required app foundation files:\n${missing.join('\n')}`);
  process.exit(1);
}

const packageJson = JSON.parse(await readText('package.json')) as {
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

for (const dependency of ['expo', 'react', 'react-native']) {
  if (!packageJson.dependencies?.[dependency]) {
    console.error(`missing dependency: ${dependency}`);
    process.exit(1);
  }
}

for (const script of ['start', 'ios', 'android', 'lint', 'format', 'build', 'test']) {
  if (!packageJson.scripts?.[script]) {
    console.error(`missing script: ${script}`);
    process.exit(1);
  }
}

console.log('build check passed');
