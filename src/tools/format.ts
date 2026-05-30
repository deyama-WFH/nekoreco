import { isTextFile, listProjectFiles, readText } from './shared';

const mode = process.argv[2] ?? '--check';
const shouldWrite = mode === '--write';
const files = (await listProjectFiles()).filter(isTextFile);
const changed: string[] = [];

for (const file of files) {
  const original = await readText(file);
  const formatted = `${original.replace(/[ \t]+$/gm, '').trimEnd()}\n`;

  if (formatted !== original) {
    changed.push(file);

    if (shouldWrite) {
      await Bun.write(file, formatted);
    }
  }
}

if (changed.length > 0 && !shouldWrite) {
  console.error(`format check failed:\n${changed.join('\n')}`);
  process.exit(1);
}

console.log(shouldWrite ? `formatted ${changed.length} files` : 'format check passed');
