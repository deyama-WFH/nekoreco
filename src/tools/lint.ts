import { isTextFile, listProjectFiles, readText } from './shared';

const files = await listProjectFiles();
const issues: string[] = [];

for (const file of files.filter(isTextFile)) {
  const text = await readText(file);

  if (text.includes('\t')) {
    issues.push(`${file}: tabs are not allowed`);
  }

  if (/[ \t]$/m.test(text)) {
    issues.push(`${file}: trailing whitespace is not allowed`);
  }

  if (!text.endsWith('\n')) {
    issues.push(`${file}: file must end with a newline`);
  }
}

if (issues.length > 0) {
  console.error(issues.join('\n'));
  process.exit(1);
}

console.log(`lint passed (${files.length} files checked)`);
