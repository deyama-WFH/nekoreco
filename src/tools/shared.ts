const textExtensions = ['.js', '.json', '.ts', '.tsx'] as const;
const ignoredDirectories = new Set(['node_modules', '.expo', 'dist', 'coverage']);

export async function listProjectFiles(directory = '.'): Promise<string[]> {
  const files: string[] = [];

  for await (const entry of new Bun.Glob('**/*').scan({
    cwd: directory,
    absolute: false,
    onlyFiles: true,
  })) {
    if (entry.split('/').some((part) => ignoredDirectories.has(part))) {
      continue;
    }

    files.push(entry);
  }

  return files.sort();
}

export function isTextFile(filePath: string): boolean {
  return textExtensions.some((extension) => filePath.endsWith(extension));
}

export async function readText(filePath: string): Promise<string> {
  return Bun.file(filePath).text();
}
