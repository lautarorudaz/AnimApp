import { spawnSync } from 'node:child_process';

for (const args of [['--test', 'tests/firestore.rules.test.mjs'], ['node_modules/@playwright/test/cli.js', 'test']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: { ...process.env, DEBUG: '' } });
  if (result.status !== 0) process.exit(result.status || 1);
}
